# Jak pracować z branchami i git flow

## Ogólne załozenia
1. Zawsze dbaj aby pracować na aktualnej wersji
2. ZAWSZE - jedno zadanie jeden PR
   1. zmiany nie mogą się nakładać na siebie z innymi
   2. zadnych zaplątanych commitów - tylko ostatni commit z main i aktualne zmiany

## Nowe zadanie
1. Aktualizacja maina
2. Odbicie sobie nowego brancha - TYLKO AKTUALNY MAIN
3. Push i ustawienie odpowiedniego brancha do merga
   1. Jeśli masz jeden task to do maina
   2. Jeśli to jest zadanie cząstkowe to do głównego feature brancha
4. Walidacja czy wysłałeś to co trzeba i code review
   1. Otwierasz PR na GH i patrzysz czy te zmiany chciałeś wrzucić
   2. Robisz sobie sam code review 
      1. Mozesz dodawać komentarze jak czegoś nie jesteś pewny
      2. Komentarze czy nie mozna czegoś zrobić lepiej
      3. Wyjaśnienia czemu tak a nie inaczej
5. Jeśli projekt się przesunął do przodu i są nowe zmiany na mainie - aktualizacja brancha

Komendy
```bash
# 1. Aktualizacja maina
git checkout main && git pull

# 2. Odbicie sobie nowego brancha (najlpiej sobie wyklikać w VSCode)
git checkout -b nazwa-brancha

# 5. Aktualizacja brancha
git fetch && git rebase origin/main
```



## Poprawki PR
Patrz pkt 5. - Aktualizacja brancha