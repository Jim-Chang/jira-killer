import os

import pygsheets
from define import TAB_COL_IDX_MAP, Tab


def get_gsheet_cred():
    return f'./credentials/{os.getenv("GSHEET_CREDENTIAL")}'


def get_dashboard_gsheet_key():
    return os.getenv("DASHBOARD_GSHEET_KEY")


class GSheetHelper:
    def __init__(self):
        self.client = pygsheets.authorize(service_file=get_gsheet_cred())
        self.sheet = self.client.open_by_key(get_dashboard_gsheet_key())

    def is_sprint_exist(self, sprint_id: str):
        col_idx = TAB_COL_IDX_MAP[Tab.SpConfig]["sprint_id"]
        wks = self.sheet.worksheet_by_title(Tab.SpConfig.value)
        return len(wks.find(sprint_id, cols=(col_idx, col_idx))) > 0

    def find_user_points_by_sprint(self, sprint_id: str):
        sp_col_idx = TAB_COL_IDX_MAP[Tab.UserSpConfig]["sprint_id"]
        wks = self.sheet.worksheet_by_title(Tab.UserSpConfig.value)
        cells = wks.find(sprint_id, cols=(sp_col_idx, sp_col_idx))

        row_idx_list = sorted([c.row for c in cells])
        min_row_idx, max_row_idx = row_idx_list[0], row_idx_list[-1]

        uname_col_idx = TAB_COL_IDX_MAP[Tab.UserSpConfig]["jira_user_name"]
        cp_sp_col_idx = TAB_COL_IDX_MAP[Tab.UserSpConfig]["tg_cp_sp_scrum"]

        rows = wks.get_values(
            (min_row_idx, uname_col_idx), (max_row_idx, cp_sp_col_idx)
        )
        # user_name_id_map = self.get_user_name_id_map()
        # ret = {user_name_id_map.get(r[uname_col_idx - 1]): r[cp_sp_col_idx - 1] for r in rows}
        ret = {r[uname_col_idx - 1]: r[cp_sp_col_idx - 1] for r in rows}
        return ret

    def get_user_name_id_map(self):
        user_id_col_idx = TAB_COL_IDX_MAP[Tab.Users]["jira_user_id"]
        uname_col_idx = TAB_COL_IDX_MAP[Tab.Users]["jira_user_name"]
        is_active_col_idx = TAB_COL_IDX_MAP[Tab.Users]["is_active"]

        wks = self.sheet.worksheet_by_title(Tab.Users.value)
        rows = wks.get_all_values(
            include_tailing_empty=False, include_tailing_empty_rows=False
        )
        ret = {
            r[uname_col_idx - 1]: r[user_id_col_idx - 1]
            for r in rows
            if len(r) >= is_active_col_idx and r[is_active_col_idx - 1] == "TRUE"
        }
        return ret
