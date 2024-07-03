use axum_extra::extract::CookieJar;

use crate::models::db::DbContext;

pub struct AppState{
    pub db : DbContext,
    pub cookie_jar : CookieJar,
}

impl AppState{
    pub async fn new(db: DbContext, cookie_jar: CookieJar) -> Result<Self, mongodb::error::Error> {
        Ok(AppState{
            db,
            cookie_jar
        })
    }
}