use crate::models::db::DbContext;

pub struct AppState{
    pub db : DbContext,
}

impl AppState{
    pub async fn new(db: DbContext) -> Result<Self, mongodb::error::Error> {
        Ok(AppState{
            db,
        })
    }
}