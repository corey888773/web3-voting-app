use axum::{http::StatusCode, response::{IntoResponse, Response}, Json};
use serde_json::{json, Value};

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug)]
pub enum Error {
    LoginFail(StatusCode, String),
    MongoError(StatusCode, String),
    SignatureVerificationFail(StatusCode, String),
    DatabaseError(StatusCode, String),
    JwtVerificationFail(StatusCode, String),
    Unauthorized,
    NotFound(StatusCode, String),
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        println!("->> {:<20} - {:?}", "Error", self);

        let (status, _) = self.extract_fields();

        if *status == StatusCode::INTERNAL_SERVER_ERROR {
            return (*status, "INTERNAL_SERVER_ERROR").into_response()
        }

        (self.to_json_response()).into_response() 
    }
}

impl std::fmt::Display for Error {
    fn fmt(&self, fmt: &mut std::fmt::Formatter) -> core::result::Result<(), std::fmt::Error>{
        write!(fmt, "{:?}", self)
    }
}

impl From<mongodb::error::Error> for Error {
    fn from(error: mongodb::error::Error) -> Self {
        Error::LoginFail(StatusCode::INTERNAL_SERVER_ERROR, error.to_string())
    }
}

impl Error {
    fn to_json_response(&self) -> (StatusCode, Json<Value>) {
        let (status_code, msg) = self.extract_fields();
        (*status_code, Json(json!({
            "status": status_code.as_u16(),
            "message": msg,
        })))
    }

    fn extract_fields(&self) -> (&StatusCode, &str) {
        match self {
            Error::Unauthorized => (&StatusCode::UNAUTHORIZED, "Unauthorized"),
            Error::NotFound(status, msg) => (status, msg),
            Error::JwtVerificationFail(status, msg) => (status, msg),
            Error::DatabaseError(status, msg) => (status, msg),
            Error::LoginFail(status, msg) => (status, msg),
            Error::MongoError(status, msg) => (status, msg),
            Error::SignatureVerificationFail(status, msg) => (status, msg),
        }
    }
}
