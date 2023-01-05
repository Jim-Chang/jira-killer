import enum


class Tab(enum.Enum):
    SpConfig = "SprintConfig"
    UserSpConfig = "UserSprintConfig"
    Teams = "Teams"
    Users = "Users"


TAB_COL_IDX_MAP = {
    Tab.SpConfig: {
        "sprint_id": 1,
        "team_name": 2,
    },
    Tab.UserSpConfig: {
        "jira_user_name": 1,
        "sprint_id": 2,
        "plan_capacity": 5,
        "plan_day_off": 6,
        "tg_cp_sp_scrum": 9,
    },
    Tab.Teams: {
        "team_name": 3,
    },
    Tab.Users: {
        "jira_user_id": 1,
        "jira_user_name": 2,
        "is_active": 3,
    },
}
