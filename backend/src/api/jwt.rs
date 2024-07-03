use std::sync::Arc;

use axum::{extract::{Extension, State}, http::{Response, StatusCode}, response::IntoResponse, routing::post, Json, Router};
use axum_extra::extract::{cookie::Cookie, CookieJar};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{app_state::AppState, utils::{error::Error, response::success}};

pub fn routes(state: Arc<AppState>) -> Router{
    let jwt_routes = Router::new()
        .route("/refresh", post(refresh_jwt))
        .with_state(state);

        Router::new().nest("/jwt", jwt_routes)
}

#[derive(Debug, Deserialize, Serialize)]
struct RefreshRequest{
    #[serde(rename = "publicAddress")] public_address: String,
}

async fn refresh_jwt(state: State<Arc<AppState>>, Extension(cookie_jar): Extension<CookieJar>, req: Json<RefreshRequest>) -> impl IntoResponse{
    println!("->> {:<20} - {:?}", "api/jwt/refresh", req);

    let refresh_token = match cookie_jar.get("refresh") {
        Some(cookie) => cookie.value().to_string(),
        None => return Err(Error::LoginFail(StatusCode::BAD_REQUEST, "No REFRESH cookie found".to_string())),
    };

    let refresh_token_claims = crate::utils::jwt::verify_jwt(&refresh_token, None)
        .map_err(|_| Error::LoginFail(StatusCode::BAD_REQUEST, "Invalid JWT".to_string()))?;
    
    if refresh_token_claims.public_address != req.public_address {
        return Err(Error::LoginFail(StatusCode::BAD_REQUEST, "Address does not match".to_string()));
    }

    let new_jwt_claims = crate::utils::jwt::Claims{
        public_address: refresh_token_claims.public_address,
        exp: chrono::Utc::now().timestamp() + 60 * 60,
        username: refresh_token_claims.username
    };
    let new_jwt = crate::utils::jwt::create_jwt(&new_jwt_claims, None);
    let new_jwt_cookie = Cookie::build(("jwt", new_jwt.clone())).path("/");

    let jar = cookie_jar.add(new_jwt_cookie);

    Ok((StatusCode::OK, jar, Json(json!({"jwt": new_jwt}))))
}