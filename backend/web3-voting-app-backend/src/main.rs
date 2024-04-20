#[allow(unused)]
use axum::middleware;
use axum::routing::get;
use axum::Router;
use tokio::net::TcpListener;
use std::sync::Arc;

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
    
    let db = DbContext::new("mongodb://root:password@localhost:27017").await.expect("Could not connect to MongoDB");
    println!("Connected to MongoDB");

    let app_state = AppState::new(db.clone()).await.expect("Could not create app state");

    let listener = TcpListener::bind("127.0.0.1:8081").await.expect("Could not create listener");

    let app = app(Arc::new(app_state));

    println!("Server running on port 8081");
    axum::serve(listener, app).await.expect("Server failed to start");
}

pub fn app(app_state: Arc<AppState>) -> Router {
    Router::new()
        .route("/hello", get(|| async { "Hello, World!" }))
        .merge(auth::routes(app_state.clone()))
        .layer(middleware::map_response(main_response_mapper))
}
