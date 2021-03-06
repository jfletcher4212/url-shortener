# FreeCodeCamp BackEnd API Projects: 
# URL Shortener Microservice

#### User Stories:
##### 1) I can pass a URL as a parameter and receive a shortened URL in the JSON response.
##### 2) When I visit that shortened URL, it will redirect me to my original link.
##### 3) Syntactically invalid URLs will return an error.

#### Example input:
`https://www.google.com/`  

#### Example output:
```
{
    "url": "https://www.google.com/",
    "short_url": "d0e196a0c"
}
```
#### Using the shortened URL:
`https://jfletcher-urlshortener.glitch.me/api/shorturl/d0e196a0c`

#### Redirects to:
`https://www.google.com/`