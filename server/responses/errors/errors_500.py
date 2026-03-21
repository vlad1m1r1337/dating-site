from fastapi.responses import JSONResponse

def internal_error():
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"}
    )
