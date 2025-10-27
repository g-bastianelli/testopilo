# Payloads Insomnia - API LMNP

## ⚠️ Important

Votre API utilise des **champs en anglais**.

Pour l'**expérience AI-first**, les champs peuvent être `null` au démarrage, et l'IA remplit progressivement les valeurs au fil de la conversation :

Champs requis (acceptent `null` au début) :

- `purchasePrice` (number | null)
- `monthlyRent` (number | null)
- `annualExpenses` (number | null)
- `holdingPeriod` (number | null)
- `taxRate` (number | null - doit être 0, 11, 30, 41 ou 45 quand renseigné)

Champs optionnels :

- `loanAmount` (number | null | undefined)
- `interestRate` (number | null | undefined)
- `loanDuration` (number | null | undefined)

Le champ `timestamp` est **optionnel** dans les messages.

---

## Configuration de base

**Base URL** : `http://localhost:3000`

---

## 1. Health Check

### GET /api/health

**URL** : `http://localhost:3000/api/health`
**Méthode** : `GET`
**Headers** : Aucun

**Réponse attendue** :

```json
{
  "status": "ok",
  "timestamp": "2025-01-19T10:30:00.000Z"
}
```

---

## 2. Chat - Démarrage avec données vides (AI-first)

### POST /api/chat

**URL** : `http://localhost:3000/api/chat`
**Méthode** : `POST`
**Headers** :

```
Content-Type: application/json
```

**Body** (démarrage à vide) :

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Bonjour, je veux simuler ma fiscalité LMNP"
    }
  ],
  "currentData": {
    "purchasePrice": null,
    "monthlyRent": null,
    "annualExpenses": null,
    "holdingPeriod": null,
    "taxRate": null
  }
}
```

**Réponse attendue** :
L'IA devrait accueillir l'utilisateur et demander les premières informations (prix d'achat, loyer, etc.)

---

## 3. Chat - Premier message avec une info

### POST /api/chat

**Body** :

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Bonjour, j'ai acheté un appartement à 200 000€"
    }
  ],
  "currentData": {
    "purchasePrice": null,
    "monthlyRent": null,
    "annualExpenses": null,
    "holdingPeriod": null,
    "taxRate": null
  }
}
```

**Réponse attendue** :
L'IA devrait détecter le prix de 200 000€, mettre à jour `purchasePrice` à 200000, et demander les autres informations manquantes.

---

## 4. Chat - Plusieurs infos en une fois

### POST /api/chat

**Body** :

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Le loyer est de 850€ par mois, j'ai 1500€ de charges annuelles et je compte le garder 12 ans"
    }
  ],
  "currentData": {
    "purchasePrice": 200000,
    "monthlyRent": null,
    "annualExpenses": null,
    "holdingPeriod": null,
    "taxRate": null
  }
}
```

**Résultat attendu** :
L'IA devrait mettre à jour :

- `monthlyRent`: 850
- `annualExpenses`: 1500
- `holdingPeriod`: 12

Et demander le taux d'imposition manquant.

---

## 5. Chat - Compléter avec le taux d'imposition

### POST /api/chat

**Body** :

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Je suis imposé à 30%"
    }
  ],
  "currentData": {
    "purchasePrice": 200000,
    "monthlyRent": 850,
    "annualExpenses": 1500,
    "holdingPeriod": 12,
    "taxRate": null
  }
}
```

**Résultat attendu** :
`taxRate` devrait être 30, et l'IA devrait indiquer que toutes les informations sont complètes et que la simulation est prête.

---

## 5. Chat - Scénario complet avec historique

### POST /api/chat

**Body** :

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Bonjour, j'ai acheté un appartement à 200 000€"
    },
    {
      "role": "assistant",
      "content": "Parfait ! J'ai bien noté que vous avez acheté votre bien à 200 000€. Quel est le montant du loyer mensuel ?"
    },
    {
      "role": "user",
      "content": "Le loyer est de 800€ par mois"
    },
    {
      "role": "assistant",
      "content": "Bien noté ! Et quelles sont vos charges annuelles ?"
    },
    {
      "role": "user",
      "content": "1500€ de charges par an, je vais le garder 10 ans et je suis imposé à 30%"
    }
  ],
  "currentData": {
    "purchasePrice": 200000,
    "monthlyRent": 800,
    "annualExpenses": 1200,
    "holdingPeriod": 8,
    "taxRate": 30
  }
}
```

**Résultat attendu** :

```json
{
  "message": "Parfait ! Toutes les informations sont complètes...",
  "updatedData": {
    "purchasePrice": 200000,
    "monthlyRent": 800,
    "annualExpenses": 1500,
    "holdingPeriod": 10,
    "taxRate": 30
  }
}
```

---

## 6. Chat - Correction d'une valeur

### POST /api/chat

**Body** :

```json
{
  "messages": [
    {
      "role": "user",
      "content": "En fait, le loyer est de 900€ et non 800€"
    }
  ],
  "currentData": {
    "purchasePrice": 200000,
    "monthlyRent": 800,
    "annualExpenses": 1500,
    "holdingPeriod": 10,
    "taxRate": 30
  }
}
```

**Résultat attendu** :

```json
{
  "message": "D'accord, j'ai bien mis à jour le loyer à 900€/mois.",
  "updatedData": {
    "purchasePrice": 200000,
    "monthlyRent": 900,
    "annualExpenses": 1500,
    "holdingPeriod": 10,
    "taxRate": 30
  }
}
```

---

## 7. Chat - Toutes les infos d'un coup

### POST /api/chat

**Body** :

```json
{
  "messages": [
    {
      "role": "user",
      "content": "J'ai acheté un bien à 250000€, le loyer est 1000€/mois, j'ai 2000€ de charges par an, je vais le garder 15 ans et je suis imposé à 41%"
    }
  ],
  "currentData": {
    "purchasePrice": 100000,
    "monthlyRent": 500,
    "annualExpenses": 1000,
    "holdingPeriod": 5,
    "taxRate": 11
  }
}
```

**Résultat attendu** :

```json
{
  "message": "Excellent ! J'ai bien compris toutes les informations...",
  "updatedData": {
    "purchasePrice": 250000,
    "monthlyRent": 1000,
    "annualExpenses": 2000,
    "holdingPeriod": 15,
    "taxRate": 41
  }
}
```

---

## 8. Test avec taxRate invalide

### POST /api/chat

**Body** :

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Je suis imposé à 35%"
    }
  ],
  "currentData": {
    "purchasePrice": 200000,
    "monthlyRent": 800,
    "annualExpenses": 1500,
    "holdingPeriod": 10,
    "taxRate": 30
  }
}
```

**Note** : Le taux de 35% n'est pas valide selon le schéma (doit être 0, 11, 30, 41 ou 45).
L'IA devrait soit :

- Convertir à 30% ou 41% (le plus proche)
- Demander clarification
- Générer une erreur de validation

---

## 9. Payload minimal pour démarrage rapide (AI-first)

### POST /api/chat

**Copy-paste rapide pour tester (démarrage à vide)** :

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Bonjour, je veux simuler ma fiscalité LMNP"
    }
  ],
  "currentData": {
    "purchasePrice": null,
    "monthlyRent": null,
    "annualExpenses": null,
    "holdingPeriod": null,
    "taxRate": null
  }
}
```

**Alternative : payload avec des valeurs déjà renseignées** :

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Bonjour"
    }
  ],
  "currentData": {
    "purchasePrice": 200000,
    "monthlyRent": 800,
    "annualExpenses": 1500,
    "holdingPeriod": 10,
    "taxRate": 30
  }
}
```

---

## 10. Test de conversation naturelle

### POST /api/chat

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Salut ! J'aimerais simuler ma fiscalité LMNP. Mon appart m'a coûté deux cent mille euros"
    }
  ],
  "currentData": {
    "purchasePrice": null,
    "monthlyRent": null,
    "annualExpenses": null,
    "holdingPeriod": null,
    "taxRate": null
  }
}
```

**Test** : L'IA devrait comprendre "deux cent mille euros" = 200000€ et demander les autres informations manquantes.

---

## Collection Insomnia (Import)

Pour importer directement dans Insomnia, créez un fichier `lmnp-api.json` :

```json
{
  "_type": "export",
  "__export_format": 4,
  "__export_date": "2025-01-19T00:00:00.000Z",
  "resources": [
    {
      "_type": "request_group",
      "name": "LMNP API",
      "_id": "req_group_lmnp",
      "environment": {
        "base_url": "http://localhost:3000"
      }
    },
    {
      "_type": "request",
      "parentId": "req_group_lmnp",
      "_id": "req_health",
      "name": "1. Health Check",
      "method": "GET",
      "url": "{{ _.base_url }}/api/health"
    },
    {
      "_type": "request",
      "parentId": "req_group_lmnp",
      "_id": "req_chat_simple",
      "name": "2. Chat - Simple",
      "method": "POST",
      "url": "{{ _.base_url }}/api/chat",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"messages\": [\n    {\n      \"role\": \"user\",\n      \"content\": \"Bonjour, j'ai acheté un appartement à 200 000€\"\n    }\n  ],\n  \"currentData\": {\n    \"purchasePrice\": 150000,\n    \"monthlyRent\": 700,\n    \"annualExpenses\": 1200,\n    \"holdingPeriod\": 10,\n    \"taxRate\": 30\n  }\n}"
      }
    },
    {
      "_type": "request",
      "parentId": "req_group_lmnp",
      "_id": "req_chat_minimal",
      "name": "3. Chat - Minimal (Quick Test)",
      "method": "POST",
      "url": "{{ _.base_url }}/api/chat",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"messages\": [\n    {\n      \"role\": \"user\",\n      \"content\": \"Bonjour\"\n    }\n  ],\n  \"currentData\": {\n    \"purchasePrice\": 200000,\n    \"monthlyRent\": 800,\n    \"annualExpenses\": 1500,\n    \"holdingPeriod\": 10,\n    \"taxRate\": 30\n  }\n}"
      }
    }
  ]
}
```

---

## Notes importantes

### Schéma de validation actuel

Le schéma Zod attend :

- **purchasePrice** : number (1000 à 10 000 000)
- **monthlyRent** : number (100 à 50 000)
- **annualExpenses** : number (0 à 100 000)
- **holdingPeriod** : number entier (1 à 50)
- **taxRate** : number (0, 11, 30, 41, ou 45)

### Champs optionnels

- **loanAmount** : number (optionnel)
- **interestRate** : number (optionnel)
- **loanDuration** : number (optionnel)

### Timestamp

Le champ `timestamp` dans les messages est **optionnel** et attend un objet `Date` (pas un number).

Pour simplifier, **ne l'incluez pas** dans vos tests.

---

## Tests recommandés

1. ✅ Health check fonctionne
2. ✅ Message simple extrait une info
3. ✅ Message complexe extrait plusieurs infos
4. ✅ Correction de valeur fonctionne
5. ✅ Historique de conversation fonctionne
6. ✅ Validation des taux d'imposition (0, 11, 30, 41, 45)
7. ✅ Gestion des erreurs pour valeurs hors limites

---

## Débogage

Si vous avez une erreur Zod, vérifiez :

1. Tous les champs requis sont présents
2. Les noms de champs sont en anglais (purchasePrice, pas prixAchat)
3. Les valeurs sont des `number`, pas des `string`
4. Le taxRate est bien 0, 11, 30, 41 ou 45
5. Pas de champ `timestamp` dans les messages (ou alors au format Date)
