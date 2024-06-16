use api::{jwt, poll};
use axum::http::header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE, COOKIE, SET_COOKIE};
use axum::http::{HeaderValue, Method};
#[allow(unused)]
use axum::middleware;
use axum::routing::get;
use axum::{Extension, Router};
use axum_extra::extract::CookieJar;
use tokio::net::TcpListener;
use std::env;
use std::sync::Arc;
use dotenvy::dotenv;
use tower_http::cors::{CorsLayer, Any};

use crate::models::db::DbContext;
use crate::utils::error::{Error, Result};
use crate::api:: {auth, middleware::main_response_mapper, middleware::add_cookie_jar};
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
    let frontend_url = env::var("FRONTEND_URL").expect("FRONTEND_URL must be set");

    let db = DbContext::new(&mongo_uri).await.expect("Could not connect to MongoDB");
    println!("Connected to MongoDB");

    let cookie_jar = CookieJar::new();
    let app_state = AppState::new(db.clone(), cookie_jar.clone()).await.expect("Could not create app state");

    let listener = TcpListener::bind(format!("127.0.0.1:{}", server_port)).await.expect("Could not create listener");

    let app = app(Arc::new(app_state), &frontend_url);

    println!("Server running on port 8081");
    axum::serve(listener, app).await.expect("Server failed to start");
}

pub fn app(app_state: Arc<AppState>, frontend_url: &str) -> Router {
    let cors = CorsLayer::new().allow_origin(frontend_url.parse::<HeaderValue>().unwrap()).allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE, COOKIE, SET_COOKIE]).allow_methods([Method::GET, Method::PUT, Method::DELETE]).allow_credentials(true);

    let api_routes = Router::new()
        .route("/hello", get(|| async { "Hello, World!" }))
        .merge(auth::routes(app_state.clone()))
        .merge(jwt::routes(app_state.clone()))
        .merge(poll::routes(app_state.clone()))
        .layer(middleware::map_response(main_response_mapper))
        .layer(middleware::from_fn(add_cookie_jar));

    Router::new() 
        .nest("/api", api_routes)
        .layer(middleware::map_response(main_response_mapper))
        .layer(cors)
}
