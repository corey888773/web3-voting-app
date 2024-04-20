use std::sync::Arc;

use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{routing::post, Json, Router};
use ethers::types::H160;
use serde::Deserialize;
use serde_json::{json, Value};

use crate::app_state::AppState;
use crate::models::user::User;
use crate::utils::nonce::generate_nonce;
use crate::utils::response::success;
use crate:: {Error, Result};

pub fn routes(state: Arc<AppState>) -> Router{
    Router::new()
        .route("/auth/nonce", post(nonce))
        .route("/auth/login", post(login))
        .route("/auth/register", post(register))
        .with_state(state)
}

#[derive(Debug, Deserialize)]
struct LoginRequest{
    #[serde(rename = "publicAddress")] public_address: String,
    #[serde(rename = "signedMessage")] signed_message: String,
    #[serde(rename = "nonce")] nonce: String,
}
async fn login(state: State<Arc<AppState>>, req: Json<LoginRequest>) -> impl IntoResponse{
    println!("->> {:<20} - {:?}", "api/login", req);

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

    Ok(success())
}

#[derive(Debug, Deserialize)]
struct RegisterRequest{
    mail: String,
    username: String,
    #[serde(rename = "publicAddress")] public_address: String,
}

async fn register(state: State<Arc<AppState>>, req: Json<RegisterRequest>) -> impl IntoResponse{
    println!("->> {:<20} - {:?}", "api/auth/register", req);

    let user = state.db.find_user_by_public_address(&req.public_address).await?;
    if user.is_some(){
        return Err(Error::LoginFail(StatusCode::BAD_REQUEST, "User already exists".to_string()));
    }

    let user = User{
        mail: req.mail.clone(),
        username: req.username.clone(),
        public_address: req.public_address.clone(),
    };

    state.db.insert_user(user.clone()).await?;

    Ok((StatusCode::CREATED, Json(user)))
}

async fn nonce(req: Json<LoginRequest>) -> Result<Json<Value>>{
    println!("->> {:<20} - {:?}", "api/auth/nonce", req);
    
    let nonce = generate_nonce();

    Ok(Json(json!({
        "nonce": nonce,
    })))
}