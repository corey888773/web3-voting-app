#[allow(unused)]
use axum::middleware;
use axum::routing::get;
use axum::Router;
use tokio::net::TcpListener;
use std::env;
use std::sync::Arc;
use dotenvy::dotenv;
use tower_http::cors::{CorsLayer, Any};

use crate::models::db::DbContext;
use crate::utils::error::{Error, Result};
use crate::api:: {auth, middleware::main_response_mapper};
use crate::app_state::AppState;

mod models;
mod api;
mod app_state;
mod utils;

#[tokio::main]
async fn main(){
    dotenvy::from_filename("src/.env").ok();

    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    let server_port = env::var("SERVER_PORT").expect("SERVER_PORT must be set");

    let db = DbContext::new(&mongo_uri).await.expect("Could not connect to MongoDB");
    println!("Connected to MongoDB");

    let app_state = AppState::new(db.clone()).await.expect("Could not create app state");

    let listener = TcpListener::bind(format!("127.0.0.1:{}", server_port)).await.expect("Could not create listener");

    let app = app(Arc::new(app_state));

    println!("Server running on port 8081");
    axum::serve(listener, app).await.expect("Server failed to start");
}

pub fn app(app_state: Arc<AppState>) -> Router {
    let cors = CorsLayer::new().allow_origin(Any).allow_headers(Any).allow_methods(Any);

    let api_routes = Router::new()
        .route("/hello", get(|| async { "Hello, World!" }))
        .merge(auth::routes(app_state.clone()))
        .layer(middleware::map_response(main_response_mapper));

    Router::new() 
        .nest("/api", api_routes)
        .layer(middleware::map_response(main_response_mapper))
        .layer(cors)
}
