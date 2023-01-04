import json

from dotenv import load_dotenv
from gsheet_helper import GSheetHelper

load_dotenv()


def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def wrap_response(func):
    def wrapper(*args, **kwargs):
        ret = func(*args, **kwargs)
        return build_response(ret[0], ret[1])

    return wrapper


class Handler:
    @staticmethod
    @wrap_response
    def get_user_plan_points_by_sprint(sprint_id: str):
        helper = GSheetHelper()

        if not helper.is_sprint_exist(sprint_id):
            return 404, {"message": "sprint not found"}

        ret = helper.find_user_points_by_sprint(sprint_id)
        return 200, ret


def lambda_handler(event, context):
    data = json.loads(event["body"])
    func_name = data.get("func_name", None)
    params = data.get("params", {})

    if not func_name:
        return build_response(400, {"message": "must provide func_name"})

    return getattr(Handler, func_name)(**params)
