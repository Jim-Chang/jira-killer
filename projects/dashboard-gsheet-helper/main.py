import json

from lambda_function import lambda_handler


def main():
    ret = lambda_handler(
        {
            "requestContext": {
                "http": {
                    "method": "POST",
                }
            },
            "body": json.dumps(
                {
                    "func_name": "get_user_plan_points_by_sprint",
                    "params": {"sprint_id": "750"},
                }
            ),
        },
        None,
    )
    print(ret)


if __name__ == "__main__":
    main()
