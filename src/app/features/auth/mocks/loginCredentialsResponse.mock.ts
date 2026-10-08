import { ApiSuccessResponse } from "../../../core/models/api/api-success.model";
import { LoginCredentialsResponse } from "../models/login-credentials.model";

export const DUMMy_LOGIN_CREDENTIALS_RESPONSE: ApiSuccessResponse<LoginCredentialsResponse> = {
    statusCode: 200,
    message: "Login successful",
    data : 
    {
        "token": "dummy_token",
    "profile": {
      "id": "dummy_id",
      "email": "dummy_email",
      "full_name": "dummy_full_name",
      "user_name": "dummy_user_name",
      "avatar_url": "dummy_avatar_url",
      "created_at": "dummy_created_at"
    }
    }
}