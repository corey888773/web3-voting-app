# Raport z projektu Web3 Voting App

## Wstęp

Projekt Web3 Voting App został stworzony jako nowoczesne rozwiązanie do zarządzania ankietami i głosowaniami opartymi na technologii blockchain. Aplikacja umożliwia użytkownikom tworzenie ankiet oraz głosowanie w nich, gwarantując transparentność i niezmienność wyników dzięki zastosowaniu smart kontraktów.

## Technologia

Projekt wykorzystuje następujące technologie:

- **Backend**: Rust Axum + MongoDB
- **Frontend**: Next.js
- **Smart Contracty**: Hardhat + Solidity
- **Blockchain**: Local Hardhat Blockchain

## Architektura

### Backend

Backend aplikacji został zaimplementowany przy użyciu frameworka Axum w języku Rust, co zapewnia wysoką wydajność i bezpieczeństwo. Dane użytkowników i ankiet są przechowywane w bazie danych MongoDB. Backend obsługuje również system uwierzytelniania, sprawdzając, czy dany publiczny adres istnieje już w naszej bazie danych. W przypadku nowego adresu, użytkownik musi zarejestrować się za pomocą adresu e-mail z domeny agh.edu.pl.

### Frontend

Frontend został zbudowany przy użyciu Next.js, co pozwala na szybkie i efektywne renderowanie stron oraz lepszą optymalizację SEO. Interfejs użytkownika jest intuicyjny i responsywny, umożliwiając łatwe zarządzanie ankietami oraz głosowanie.

### Smart Contracty

Smart kontrakty zostały napisane w języku Solidity i wdrożone lokalnie przy użyciu narzędzia Hardhat. Kontrakty zarządzają logiką tworzenia ankiet, oddawania głosów oraz weryfikacją wyników. Ze względu na ograniczenia czasowe i budżetowe, smart kontrakty nie zostały wdrożone na testnet.

## Funkcjonalności

1. **Rejestracja i logowanie**:

   - Użytkownik musi zarejestrować się za pomocą adresu e-mail z domeny agh.edu.pl.
   - Uwierzytelnianie odbywa się poprzez sprawdzenie, czy dany publiczny adres jest już zarejestrowany w bazie danych.

2. **Tworzenie ankiet**:

   - Zalogowani użytkownicy mogą tworzyć ankiety, definiując pytania i możliwe odpowiedzi.
   - Ankiety są zapisywane na blockchainie, co gwarantuje ich niezmienność.

3. **Głosowanie**:

   - Użytkownicy mogą głosować w dostępnych ankietach.
   - Każdy głos jest zapisywany na blockchainie, co zapewnia transparentność i niezmienność wyników.

4. **Zarządzanie ankietami**:
   - Twórcy ankiet mogą zarządzać swoimi ankietami, np. zakończyć głosowanie i sprawdzić wyniki.

## Proces rejestracji i uwierzytelniania

1. Użytkownik wchodzi na stronę rejestracji i podaje swój publiczny adres oraz adres e-mail z domeny agh.edu.pl.
2. Backend sprawdza, czy dany publiczny adres istnieje już w bazie danych.
   - Jeśli adres istnieje, użytkownik jest logowany.
   - Jeśli adres nie istnieje, użytkownik jest proszony o rejestrację za pomocą e-maila z domeny agh.edu.pl.
3. Po pomyślnej rejestracji użytkownik może logować się do systemu i korzystać z jego funkcjonalności.

# Improvement Proposals

### Ulepszenie nawigacji i funkcjonowania bez oczekiwania na zatwierdzenie transakcji

Aby poprawić wygodę poruszania się po stronie i umożliwić użytkownikom funkcjonowanie bez oczekiwania na zatwierdzenie transakcji, wprowadziliśmy już pierwsze kroki w tym kierunku.

Obecnie każda transakcja jest przesyłana na backend. Backend oczekuje na rozwiązanie transakcji i poprzez połączenie WebSocket notyfikuje użytkowników na stronie, co pozwala im korzystać z aplikacji w sposób nieblokujący (nonblocking). Użytkownicy mogą kontynuować interakcję z aplikacją, a status transakcji jest aktualizowany w czasie rzeczywistym.

**Dalsze kroki do wdrożenia:**

1. **Optymalizacja Backend-WebSocket**: Zapewnienie niskich opóźnień i wysokiej niezawodności połączeń WebSocket, aby użytkownicy byli natychmiastowo informowani o statusie transakcji.
2. **UI/UX Enhancements**: Implementacja wizualnych wskaźników statusu transakcji w interfejsie użytkownika, takich jak paski postępu czy powiadomienia, które informują użytkowników o przebiegu transakcji.
3. **Fallback Mechanisms**: Dodanie mechanizmów awaryjnych, takich jak ponowne połączenie WebSocket w przypadku utraty połączenia, aby zapewnić ciągłość działania.

## Rozwiązanie problemu przechowywania danych dotyczących ankiet w smart kontrakcie

Przechowywanie dużej ilości danych w smart kontrakcie może prowadzić do wysokich kosztów transakcji i operacji na ankietach. Poniżej przedstawiamy dwa rozwiązania tego problemu:

### **Wykorzystanie IPFS (InterPlanetary File System)**

[Link do artykułu na temat smart contract factory](https://medium.com/@solidity101/unlocking-the-power-of-ipfs-ethereum-tutorial-8b12a223ff3d)

IPFS to zdecentralizowany system plików, który umożliwia przechowywanie i udostępnianie danych w sposób skalowalny i odporny na cenzurę.

**Implementacja:**

- **Przechowywanie Danych:** Zamiast przechowywać pełne dane ankiet w smart kontrakcie, można je przechowywać w IPFS, a w smart kontrakcie przechowywać jedynie hashe (adresy) tych danych.
- **Hash Management:** Gdy użytkownik tworzy lub głosuje w ankiecie, dane są przesyłane do IPFS, a hash zwrócony przez IPFS jest zapisywany w smart kontrakcie.
- **Retrieval:** Podczas odczytywania danych, smart kontrakt udostępnia hash, a aplikacja frontendowa pobiera pełne dane z IPFS.

**Zalety:**

- Zmniejszenie kosztów przechowywania danych na blockchainie.
- Skalowalność i decentralizacja przechowywania danych.

**Wady:**

- Konieczność zarządzania dostępem i bezpieczeństwem danych w IPFS.

### **Wykorzystanie Smart Contract Factory**

[Link do artykułu na temat smart contract factory](https://medium.com/@solidity101/demystifying-the-factory-pattern-in-solidity-efficient-contract-deployment-with-factory-pattern-e233ea6d1ec0)

Smart Contract Factory to wzorzec projektowy, który umożliwia tworzenie wielu instancji smart kontraktów z jednego "fabrycznego" kontraktu.

**Implementacja:**

- **Indywidualne Kontrakty:** Zamiast przechowywać wszystkie dane ankiet w jednym kontrakcie, każda ankieta może być reprezentowana przez osobny smart kontrakt utworzony przez fabrykę.
- **Factory Contract:** Fabryczny kontrakt zarządza tworzeniem nowych kontraktów ankietowych i przechowuje jedynie ich adresy.
- **Modularność:** Każdy kontrakt ankietowy zarządza własnymi danymi, co umożliwia bardziej złożone operacje bez zwiększania kosztów w jednym kontrakcie głównym.

**Zalety:**

- Redukcja kosztów poprzez dystrybucję danych między wieloma kontraktami.
- Możliwość łatwiejszej aktualizacji i zarządzania poszczególnymi ankietami.

**Wady:**

- Złożoność zarządzania wieloma kontraktami.
- Potencjalnie większa liczba transakcji potrzebnych do zarządzania ankietami.

## Ułatwienie korzystania z aplikacji dla użytkowników bez wiedzy o blockchainie

Aby umożliwić korzystanie z aplikacji Web3 Voting App użytkownikom, którzy nie mają żadnej wiedzy o blockchainie, można wdrożyć następujące rozwiązania:

### **Generowanie portfela na podstawie adresu e-mail**

Zamiast wymagać od użytkowników samodzielnego generowania i zarządzania portfelami kryptowalutowymi, można zautomatyzować ten proces poprzez generowanie portfela na podstawie adresu e-mail użytkownika.

**Implementacja:**

- **Rejestracja użytkownika:** Podczas rejestracji, użytkownik podaje swój adres e-mail (np. z domeny agh.edu.pl).
- **Generowanie portfela:** Na podstawie tego adresu e-mail generowany jest portfel kryptowalutowy, przy użyciu deterministycznego algorytmu. Można wykorzystać mechanizmy takie jak BIP-39 (Mnemonic Phrase) do deterministycznego tworzenia kluczy prywatnych z danych wejściowych (e-mail + hasło).
- **Przechowywanie portfela:** Klucze prywatne mogą być przechowywane bezpiecznie na serwerze backendowym lub zaszyfrowane i przechowywane po stronie klienta (np. w przeglądarce).

**Zalety:**

- Użytkownicy nie muszą zarządzać własnymi portfelami kryptowalutowymi.
- Bezproblemowy onboarding dla osób bez wiedzy o blockchainie.

**Wady:**

- Potrzeba bezpiecznego przechowywania kluczy prywatnych.
- Potencjalne obawy o bezpieczeństwo i prywatność użytkowników.

### **Przejmowanie opłat za gas (gasPrice) przez stronę**

Aby użytkownicy nie musieli płacić za gasPrice podczas wykonywania transakcji na blockchainie, aplikacja może przejąć te opłaty.

**Implementacja:**

- **Sponsorowane transakcje:** Strona może przechwytywać i sponsorować opłaty za gas. W praktyce oznacza to, że backend aplikacji będzie zarządzał portfelem, z którego będą opłacane transakcje użytkowników.
- **Meta-transactions:** Wykorzystanie meta-transakcji pozwala użytkownikom na podpisywanie transakcji bez konieczności posiadania Ethera (lub innej kryptowaluty) na pokrycie kosztów gas. Użytkownik podpisuje transakcję off-chain, a backend przesyła ją na blockchain, pokrywając opłaty za gas.
- **Ekonomiczne modele:** Można zaimplementować ekonomiczne modele, w których aplikacja pokrywa koszty gas poprzez sponsorów, reklamodawców lub opłaty abonamentowe od użytkowników premium.

**Zalety:**

- Eliminacja konieczności posiadania kryptowalut przez użytkowników.
- Ułatwienie korzystania z aplikacji dla osób bez wiedzy o blockchainie.

**Wady:**

- Konieczność zabezpieczenia funduszy na pokrycie kosztów gas.
- Potencjalnie wysokie koszty operacyjne dla aplikacji.

## Podsumowanie

Web3 Voting App to nowoczesna aplikacja do zarządzania ankietami i głosowaniami, która wykorzystuje technologię blockchain do zapewnienia transparentności i niezmienności wyników. Dzięki zastosowaniu technologii takich jak Rust Axum, MongoDB, Next.js, Hardhat i Solidity, aplikacja jest wydajna i bezpieczna. Propozycje ulepszeń, takie jak optymalizacja nawigacji, wykorzystanie IPFS i Smart Contract Factory oraz uproszczenie korzystania z aplikacji dla użytkowników bez wiedzy o blockchainie, mogą znacząco poprawić doświadczenia użytkowników i obniżyć koszty operacyjne.
