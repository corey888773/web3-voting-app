use std::sync::Arc;

use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{routing::post, Json, Router};
use axum_extra::extract::cookie::Cookie;
use axum_extra::extract::CookieJar;
use ethers::types::H160;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::app_state::AppState;
use crate::models::user::User;
use crate::utils::nonce::generate_nonce;
use crate::utils::response::success;
use crate:: {Error, Result};

pub fn routes(state: Arc<AppState>) -> Router{
    let auth_routes = Router::new()
        .route("/nonce", post(nonce))
        .route("/login", post(login))
        .route("/register", post(register))
        .with_state(state)
        .with_state(CookieJar::default());

    Router::new().nest("/auth", auth_routes)
}

#[derive(Debug, Deserialize)]
struct LoginRequest{
    #[serde(rename = "publicAddress")] public_address: String,
    #[serde(rename = "signedMessage")] signed_message: String,
    #[serde(rename = "nonce")] nonce: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct LoginResponse{
    #[serde(rename = "publicAddress")] public_address: String,
    #[serde(rename = "username")] username: String,
    #[serde(rename = "mail")] mail: String,
    #[serde(rename = "jwt")] jwt: String,
    #[serde(rename = "refreshToken")] refresh_token: String,
}
async fn login(state: State<Arc<AppState>>, cookie_jar: CookieJar, req: Json<LoginRequest>) -> impl IntoResponse{
    println!("->> {:<20} - {:?}", "api/auth/login", req);

    let user = state.db.find_user_by_public_address(&req.public_address).await?;
    if user.is_none(){
        return Err(Error::LoginFail(StatusCode::BAD_REQUEST, "User not found".to_string()));
    }

    let public_address: H160 = req.public_address.parse().unwrap();
    let signature: ethers::core::types::Signature = req.signed_message.parse().unwrap();
    let recovered_address = signature.recover(req.nonce.as_bytes()).unwrap(); 
    
    if public_address != recovered_address {
        return Err(Error::SignatureVerificationFail(StatusCode::BAD_REQUEST, "Address does not match signature".to_string()));
    }

    let user = user.unwrap();
    if user.nonce != req.nonce {
        return Err(Error::SignatureVerificationFail(StatusCode::BAD_REQUEST, "Nonce does not match".to_string()));
    }

    let jwt_claims = crate::utils::jwt::Claims{
        public_address: user.public_address.clone(),
        exp: (chrono::Utc::now() + chrono::Duration::minutes(1)).timestamp(),
    };
    let jwt = crate::utils::jwt::create_jwt(&jwt_claims);
    let jwt_cookie = Cookie::build(("jwt", jwt.clone())).path("/");

    let refresh_token_claims = crate::utils::jwt::Claims{
        public_address: user.public_address.clone(),
        exp: (chrono::Utc::now() + chrono::Duration::days(1)).timestamp(),
    };
    let refresh_token = crate::utils::jwt::create_jwt(&refresh_token_claims);
    let refresh_cookie = Cookie::build(("refresh", refresh_token.clone())).path("/");

    let jar = cookie_jar.add(jwt_cookie).add(refresh_cookie);

    let response = LoginResponse{
        public_address: user.public_address.clone(),
        username: user.username.clone(),
        mail: user.mail.clone(),
        jwt: jwt.clone(),
        refresh_token: refresh_token.clone(),
    };
 
    Ok((StatusCode::OK, jar, Json(response)))
}

#[derive(Debug, Deserialize)]
struct RegisterRequest{
    #[serde(rename = "mail")] mail: String,
    #[serde(rename = "username")] username: String,
    #[serde(rename = "publicAddress")] public_address: String,
}

async fn register(state: State<Arc<AppState>>, cookie_jar: CookieJar, req: Json<RegisterRequest>) -> impl IntoResponse{
    println!("->> {:<20} - {:?}", "api/auth/register", req);

    let user = state.db.find_user_by_public_address(&req.public_address).await?;
    if user.is_some(){
        return Err(Error::LoginFail(StatusCode::BAD_REQUEST, "User already exists".to_string()));
    }

    let user = User{
        mail: req.mail.clone(),
        username: req.username.clone(),
        public_address: req.public_address.clone(),
        nonce: generate_nonce(),
    };

    state.db.insert_user(user.clone()).await?;

    let jwt_claims = crate::utils::jwt::Claims{
        public_address: user.public_address.clone(),
        exp: (chrono::Utc::now() + chrono::Duration::minutes(1)).timestamp(),
    };
    let jwt = crate::utils::jwt::create_jwt(&jwt_claims);
    let jwt_cookie = Cookie::build(("jwt", jwt.clone())).path("/");

    let refresh_token_claims = crate::utils::jwt::Claims{
        public_address: user.public_address.clone(),
        exp: (chrono::Utc::now() + chrono::Duration::days(1)).timestamp(),
    };
    let refresh_token = crate::utils::jwt::create_jwt(&refresh_token_claims);
    let refresh_cookie = Cookie::build(("refresh", refresh_token.clone())).path("/");

    let jar = cookie_jar.add(jwt_cookie).add(refresh_cookie);

    Ok((StatusCode::CREATED, jar , Json(user)))
}


#[derive(Debug, Deserialize)]
struct NonceRequest{
    #[serde(rename = "publicAddress")] public_address: String,
}
async fn nonce(state: State<Arc<AppState>>, cookie_jar: CookieJar, req: Json<NonceRequest>) -> impl IntoResponse{
    println!("->> {:<20} - {:?}", "api/auth/nonce", req);

    let user = state.db.find_user_by_public_address(&req.public_address).await?;
    if user.is_none(){
        return Err(Error::LoginFail(StatusCode::BAD_REQUEST, "User not found".to_string()));
    }

    let nonce = user.unwrap().nonce;
    if nonce.is_empty() {
        return Err(Error::LoginFail(StatusCode::BAD_REQUEST, "Nonce not found".to_string()));
    }

    Ok((StatusCode::OK, Json(json!({ "nonce": nonce })) ))
}