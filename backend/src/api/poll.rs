use std::sync::Arc;

use axum::{extract::{Extension, State}, http::StatusCode, middleware, response::IntoResponse, routing::{get, post}, Json, Router};
use axum_extra::extract::CookieJar;
use serde::{Deserialize, Serialize};

use crate::{app_state::AppState, models::{poll::Poll, vote::Vote}, utils::{error::Error, jwt::Claims, response::success}};

use super::middleware::authorize;

pub fn routes(state: Arc<AppState>) -> Router{
    let jwt_routes = Router::new()
        .route("/votes", post(get_votes))
        .route("/vote", post(vote))
        .route("/create", post(create_poll))
        .route("/my", post(get_my_polls))
        .route_layer(middleware::from_fn_with_state(state.clone(), authorize))
        .with_state(state);

        Router::new().nest("/polls", jwt_routes)
}

#[derive(Debug, Deserialize, Serialize)]
struct VoteRequest{
    #[serde(rename = "contractAddress")] contract_address: String,
    #[serde(rename = "transactionHash")] transaction_hash: String,
    #[serde(rename = "pollId")] poll_id: String,
    #[serde(rename = "answers")] answers: Vec<i32>
    
}

async fn vote(Extension(claims) : Extension<Claims>, state: State<Arc<AppState>>, req: Json<VoteRequest>) -> impl IntoResponse{
    println!("->> {:<20} - {:?}", "api/poll/vote", req);

    let vote = Vote{
        contract_address: req.contract_address.clone(),
        poll_id: req.poll_id.clone(),
        answers: req.answers.clone(),
        transaction_hash: req.transaction_hash.clone(),
    };

    match state.db.insert_vote(&claims.public_address, &vote).await {
        Ok(_) => (),
        Err(e) => return Err(Error::DatabaseError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }

    let poll = state.db.find_poll_by_id(&req.poll_id).await;
    if poll.is_ok() && poll.as_ref().unwrap().is_some() {
        state.db.update_poll_votes(&req.poll_id, &req.answers).await.map_err(|e| Error::DatabaseError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }

    Ok(success())
}

#[derive(Debug, Deserialize, Serialize)]
struct CreatePollRequest{
    #[serde(rename = "contractAddress")] contract_address: String,
    #[serde(rename = "transactionHash")] transaction_hash: String,
    #[serde(rename = "pollId")] poll_id: String,
    #[serde(rename = "question")] question: String,
    #[serde(rename = "options")] options: Vec<String>,
    #[serde(rename = "possibleAnswers")] possible_answers: i32,
    #[serde(rename = "endDateTime")] end_date_time: i64,
    #[serde(rename = "creatorAddress")] creator_address: String,
}

async fn create_poll(state: State<Arc<AppState>>, Extension(cookie_jar): Extension<CookieJar>, req: Json<CreatePollRequest>) -> impl IntoResponse{
    println!("->> {:<20} - {:?}", "api/poll/create", req);
    println!("->> {:<20} - {:?}", "CookieJar", cookie_jar.iter().collect::<Vec<_>>());

    let mut initial_votes = vec![];
    for _ in 0..req.possible_answers {
        initial_votes.push(0);
    }

    let poll = Poll{
        contract_address: req.contract_address.clone(),
        poll_id: req.poll_id.clone(),
        question: req.question.clone(),
        options: req.options.clone(),
        possible_answers: req.possible_answers,
        end_date_time: req.end_date_time,
        transaction_hash: req.transaction_hash.clone(),
        creator_address: req.creator_address.clone(),
        votes_count: initial_votes
    };

    match state.db.insert_poll(poll).await {
        Ok(_) => Ok(success()),
        Err(e) => return Err(Error::DatabaseError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Debug, Deserialize, Serialize)]
struct ContractAddressRequest{
    #[serde(rename = "contractAddress")] contract_address: String,
}
async fn get_votes(state: State<Arc<AppState>>, Extension(claims): Extension<Claims>, req: Json<ContractAddressRequest>) -> impl IntoResponse{
    println!("->> {:<20} - {:?}", "api/poll/votes", claims.public_address);
    
    let votes = state.db.find_votes_by_public_address(&claims.public_address, &req.contract_address).await;
    match votes {
        Ok(votes) => Ok(Json(votes)),
        Err(e) => Err(Error::DatabaseError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

async fn get_my_polls(state: State<Arc<AppState>>, Extension(claims): Extension<Claims>, req: Json<ContractAddressRequest>) -> impl IntoResponse{
    println!("->> {:<20} - {:?}", "api/poll/mypolls", claims.public_address);

    let polls = state.db.find_polls_by_creator_address(&claims.public_address, &req.contract_address).await;
    match polls {
        Ok(polls) => Ok(Json(polls)),
        Err(e) => Err(Error::DatabaseError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}