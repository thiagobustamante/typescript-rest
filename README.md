# REST Services for Typescript
This is a lightweight annotation-based expressjs extension for typescript.

It can be used to define your APIs using ES7 decorators.

**Table of Contents** 

- [REST Services for Typescript](#)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Basic Usage](#basic-usage)

## Installation

This library only works with typescript. Ensure it is installed:

```bash
npm install typescript -g
```

To install typescript-rest:

```bash
npm install typescript-rest --save
```

## Configuration

Typescript-rest requires the following TypeScript compilation options in your tsconfig.json file:

```typescript
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Basic Usage

```typescript
import * as express from "express";
import {Server, Path, GET, PathParam} from "../typescript-rest";

@Path("/hello")
class PersonService {
  @Path(":name")
  @GET
  sayHello( @PathParam('name') name: string): string {
    return "Hello " + name;
  }
}

let app: express.Application = express();
Server.buildServices(app);

app.listen(3000, function() {
  console.log('Rest Server listening on port 3000!');
});

```

That's it. You can just call now:

```
GET http://localhost:3000/hello/joe
```

