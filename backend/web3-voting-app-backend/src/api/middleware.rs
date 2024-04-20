use axum::response::Response;

pub async fn main_response_mapper(res: Response) -> Response {
    println!("->> {:<20} - {:?}", "Response", res);

    println!();
    res
}