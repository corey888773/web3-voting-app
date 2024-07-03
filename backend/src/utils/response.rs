pub fn success() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "success": true,
    }))
}