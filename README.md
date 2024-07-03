# web3-voting-app

## Raport

Zachęcam do zapoznania się z [raportem](RAPORT.md) z projektu w pliku. W raporcie opisujemy funkcjonalność projektu jak i dalsze propozycje ulepszenia funkcjonalności aplikacji

## Wymagania

> Rust + Cargo
> Yarn
> Docker
> Metamask w przeglądarce chrome

### Włączanie Smart Contractu

```bash
cd smart-contract
yarn install # instaluje zależności
yarn hardhat node # włącza lokalny blockchain
```

#### Konfiguracja

> 1. Skopiuj privateAddress z kont w konsoli hardhat node i zaimportuj go do swojego metamaska
> 2. W metamasku w sekcji networks dodaj nową sieć z ustawieniami wyświetlonymi w konsoli hardhat node

#### Rozwiazania problemow z nodem lub reset node'a w celu zresetowania danych o pollach

> 1. Jak sieć hardhat nie działa to:
> 1. W koncie zaimportowanym z hardhat: metamask > ustawienia zaawansowane > clear activity data
> 1. W konsoli w której działa hardhat node: ctrl+c > yarn hardhat node
> 1. Jak zrobilas 3 to trzeba powtorzyc punkt 1

### Włączanie Backendu

```bash
cd backend
docker compose -f docker-compose.local.yaml up -d # odpala lokalną bazę danych
cargo watch -q -c -w src/ -x run # odpala backend w trybie watch
```

### Włączanie Frontendu

```bash
cd frontend
yarn install # instaluje zależności
yarn dev # odpala frontend w trybie watch
```
