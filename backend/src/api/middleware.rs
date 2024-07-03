use std::sync::Arc;

use axum::{extract::{Request, Extension}, http::StatusCode, middleware::Next, response::Response};
use axum_extra::extract::{cookie::Cookie, CookieJar};

use crate::{app_state::AppState, utils::jwt::verify_jwt};

pub async fn main_response_mapper(res: Response) -> Response {
    println!("->> {:<20} - {:?}", "Response", res);

    println!();
    res
}

pub async fn authorize(mut request: Request, next: Next) -> Result<Response, StatusCode> {
    println!("->> {:<20}", "Authorize");
    let cookie_jar = request.extensions().get::<CookieJar>().ok_or(StatusCode::INTERNAL_SERVER_ERROR)?; 
    println!("->> {:<20} - {:?}", "CookieJar", cookie_jar.iter().collect::<Vec<_>>());
    let cookie = cookie_jar.get("jwt").ok_or(StatusCode::UNAUTHORIZED)?;

    let jwt = cookie.value();
    let claims = verify_jwt(jwt, None)
        .map_err(|err| {
            println!("->> {:<20} - {:?}", "Error", err);
            StatusCode::UNAUTHORIZED})?;

    request.extensions_mut().insert(claims);

    Ok(next.run(request).await)
}

pub async fn add_cookie_jar(mut req: Request, next: Next) -> Result<Response, StatusCode> {
    let cookies = req.headers().get("Cookie");
    if cookies.is_none(){
        let cookie_jar = CookieJar::new();
        req.extensions_mut().insert(cookie_jar);
        return Ok(next.run(req).await);
    }

    let cookie_jar = CookieJar::from_headers(req.headers());
    req.extensions_mut().insert(cookie_jar);

    Ok(next.run(req).await)
}