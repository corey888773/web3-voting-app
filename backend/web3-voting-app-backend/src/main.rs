use axum::{
    extract::{Path, Query, State}, http::StatusCode, response::IntoResponse, routing::{get, patch, post}, Json, Router
};

use serde::{Deserialize, Serialize};
use serde_json::json;

use mongodb::{Client, options::ClientOptions};

use tokio::net::TcpListener;

#[tokio::main]
async fn main(){
    let mut client_options = ClientOptions::parse("mongodb://root:password@localhost:27017").await.expect("Could not parse client options");
    let client = Client::with_options(client_options).expect("Could not create client");
    println!("Connected to MongoDB");

    let listener = TcpListener::bind("127.0.0.1:8080").await.expect("Could not create listener");

    let app = Router::new()
        .route("/hello", get(|| async { "Hello, World!" }))
        .route("/auth/nonce", post(auth_nonce));

    println!("Server running on port 8080");
    axum::serve(listener, app).await.expect("Server failed to start");
}

#[derive(Debug, Deserialize)]
struct AuthNonceRequest {
    publicAddress: String,
}

async fn auth_nonce(Query(params): Query<AuthNonceRequest>) -> impl IntoResponse {
    let nonce = "123456";

    println!("Auth nonce request for public address: {}", params.publicAddress);

    let response = json!({
        "nonce": nonce,
    }); 

    Json(response)
}