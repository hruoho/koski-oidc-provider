# README

Tässä testailuun tarkoitetussa repossa on hahmoteltu oidc-providerin toteutusta node-oidc-provider -kirjastoa 
käyttäen ja ko. repon esimerkkien avulla. 

Tätä nikkaroidessa oletus oli, että provider tulisi Kosken ulkopuolelle, clientin ja Kosken väliin. 
Ilmeisesti olisi kuitenkin parempi, että provideriin pääsee vain Koski-kirjautumisen jälkeen, eli client voisi 
olettaa Koski-kirjautumisen olevan voimassa. Tästä huolehdittaisiin infran tasolla. Käsillä olevassa "protossa"
niin ei kuitenkaan ole vaan Kosken kirjautumiseen mennään vasta providerista ja sitten leikitään että paluuarvona 
saatiin account id: `mock-account-id`.

Provideria voi kokeilla muistinvaraisena tai käyttäen lokaalia DynamoDb-taulua 
sessioiden tallentamiseen. 

Repossa on käytetty `.mts` -tiedostoja yhteensopivuusongelman takia: 
oidc-provider on es-moduli, mutta dynamodb-adapterin käyttämä aws sdk commonjs-moduuli

Jos ympäristömuuttujaa DYNAMODB_URI ei ole annettu, skripti käyttää muistinvaraista provideria. 

Juuressa on verkosta kopioitu shell-skripti, jolla lokaalin DynamoDB-taulun voi luoda: `create-dynamodb-table.sh`. 

Providerin voi käynnistää seuraavasti:

```
DYNAMODB_URI=http://localhost:8000 OAUTH_TABLE=oauth-sessions AWS_REGION=eu-west-1 ts-node-esm index.mts
```
