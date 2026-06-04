async def get_recent_activity():

    return [
        {
            "type": "user_registered",
            "message": "Sathwik registered",
            "time": "5 mins ago"
        },
        {
            "type": "organization_created",
            "message": "TCS organization created",
            "time": "10 mins ago"
        },
        {
            "type": "membership_added",
            "message": "Sathwik joined TCS",
            "time": "15 mins ago"
        }
    ]

async def revenue_trends():

    return [
        {"month": "Jan", "revenue": 25000},
        {"month": "Feb", "revenue": 32000},
        {"month": "Mar", "revenue": 41000},
        {"month": "Apr", "revenue": 58000},
        {"month": "May", "revenue": 72000},
        {"month": "Jun", "revenue": 95000}
    ]


async def user_growth():

    return [
        {"month": "Jan", "users": 2},
        {"month": "Feb", "users": 5},
        {"month": "Mar", "users": 8},
        {"month": "Apr", "users": 12},
        {"month": "May", "users": 18},
        {"month": "Jun", "users": 25}
    ]