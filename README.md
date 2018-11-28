[![npm version](https://badge.fury.io/js/typescript-rest.svg)](https://badge.fury.io/js/typescript-rest)
[![Build Status](https://travis-ci.org/thiagobustamante/typescript-rest.svg?branch=master)](https://travis-ci.org/thiagobustamante/typescript-rest)
[![Coverage Status](https://coveralls.io/repos/github/thiagobustamante/typescript-rest/badge.svg?branch=master)](https://coveralls.io/github/thiagobustamante/typescript-rest?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/thiagobustamante/typescript-rest/badge.svg?targetFile=package.json)](https://snyk.io/test/github/thiagobustamante/typescript-rest?targetFile=package.json)

# REST Services for Typescript
This is a lightweight annotation-based [expressjs](http://expressjs.com/) extension for typescript.

It can be used to define your APIs using ES7 decorators.

**Project Sponsors**

This project is supported by [Leanty](https://github.com/Leanty/)'s team and is widely used by its main product: The [Tree Gateway](http://www.treegateway.org) API Gateway.

**Table of Contents** 

- [REST Services for Typescript](#)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Basic Usage](#basic-usage)
  - [Boilerplate Project](#boilerplate-project)  
  - [Complete Guide](#complete-guide)
    - [Server](#server)
      - [Registering Services](#registering-services)
    - [@Path Decorator](#path-decorator)
      - [Path Parameters](#path-parameters)
    - [@Security Decorator](#security-decorator)
    - [Http Methods](#http-methods)
    - [Parameters](#parameters)
    - [Service Context](#service-context)
    - [Service Return](#service-return)
      - [Asynchronous services](#asynchronous-services)
    - [Errors](#errors)
    - [BodyParser Options](#bodyparser-options)
    - [Types and languages](#types-and-languages)
    - [IoC](#ioc)
    - [Inheritance and abstract services](#inheritance-and-abstract-services)    
    - [Preprocessors](#preprocessors)
  - [Swagger](#swagger)
 - [Breaking Changes - 1.0.0](#breaking-changes)

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
import {Server, Path, GET, PathParam} from "typescript-rest";

@Path("/hello")
class HelloService {
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

## Boilerplate Project

You can check [this project](https://github.com/vrudikov/typescript-rest-boilerplate) to get started.

## Complete Guide

This library allows you to use ES7 decorators to configure your services using 
expressjs. 

### Server

The Server class is used to configure the server, like: 

```typescript
let app: express.Application = express();
Server.setFileDest('/uploads');
Server.buildServices(app);
app.listen(3000, function() {
  console.log('Rest Server listening on port 3000!');
});
```

Note that Server receives an ```express.Router``` instance. Then it configures
all the routes based on the decorators used on your classes.

So, you can use also any other expressjs feature, like error handlers, middlewares etc 
without any restriction.  

#### Registering Services

When you call: 

```typescript
Server.buildServices(app);
```

The service will expose all services that can be found in the imported module into the express router provided. But it is possible to choose which services you want to expose.

```typescript
import * as express from "express";
import {Server} from "typescript-rest";
import {ServiceOne} from "./service-one";
import {ServiceTwo} from "./service-two";
import {ServiceThree} from "./service-three";

let app: express.Application = express();
Server.buildServices(app, ServiceOne, ServiceTwo, ServiceThree);
```

It is possible to use multiples routers:


```typescript
Server.buildServices(adminRouter, ...adminApi);
Server.buildServices(app, ServiceOne);
```

And it is, also, possible to use glob expressions to point where your services are:

```typescript
const app = express();

const apis = express.Router();
const admin = express.Router();

Server.loadServices(apis, 'lib/controllers/apis/*');
Server.loadServices(admin, 'lib/controllers/admin/*');

app.use('apis', apis);
app.use('admin', admin);
```

That will register all services exported by any file located under ```lib/controllers/apis``` in the ```apis``` router and services in ```lib/controllers/admin``` in the ```admin``` router.

Negation is also supported in the glob patterns:

```typescript
  Server.loadServices(app, ['lib/controllers/*', '!**/exclude*']); 
  // includes all controllers, excluding that one which name starts with 'exclude'
```

And it is possilbe to inform a base folder for the patterns: 

```typescript
  Server.loadServices(app, 'controllers/*', `${__dirname}/..`]); 
  // Inform a folder as origin for the patterns
```

### @Path Decorator

The @Path decorator allow us to define a router path for a given endpoint.
Route paths, in combination with a request method, define the endpoints at 
which requests can be made. Route paths can be strings, string patterns, or regular expressions.

The characters ?, +, *, and () are subsets of their regular expression counterparts. 
The hyphen (-) and the dot (.) are interpreted literally by string-based paths.


*We use [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) for matching the 
route paths; see the path-to-regexp documentation for all the possibilities in defining route paths.*


Some examples:

```typescript
@Path("/hello")
class HelloService {
}
```

```typescript
@Path("/test/hello")
class TestService {
}
```

This route path will match acd and abcd:

```typescript
@Path("ab?cd")
class TestService {
}
```

This route path will match abcd, abbcd, abbbcd, and so on:

```typescript
@Path("ab+cd")
class TestService {
}
```

This route path will match abcd, abxcd, abRANDOMcd, ab123cd, and so on:

```typescript
@Path("ab*cd")
class TestService {
}
```

This route path will match /abe and /abcde:

```typescript
@Path("/ab(cd)?e")
class TestService {
}
```

This route path will match butterfly and dragonfly, but not butterflyman, dragonfly man, and so on:

```typescript
@Path("/.*fly$/")
class TestService {
}
```
#### Path Parameters

Route parameters are named URL segments that are used to capture the values specified at their position in the URL. 
The captured values are populated in the req.params object, with the name of the route parameter specified in 
the path as their respective keys. They can be refered through @PathParam decorator on a service method argument.

Some examples:

```typescript
@Path("/users")
class UserService {
   @Path("/:userId/books/:bookId")
   @GET
   getUserBook(@PathParam("userId") userId: number, @PathParam("bookId") bookId: number): Promise<Book> {
      //...
   }
}
```
The requested URL http://localhost:3000/users/34/books/8989 would map the parameters as:

```
   userId: "34"
   bookId: "8989"
```

Since the hyphen (-) and the dot (.) are interpreted literally, they can be used along with route 
parameters for useful purposes.

```
Route path: /flights/:from-:to
Request URL: http://localhost:3000/flights/LAX-SFO
req.params: { "from": "LAX", "to": "SFO" }
```

```
Route path: /plantae/:genus.:species
Request URL: http://localhost:3000/plantae/Prunus.persica
req.params: { "genus": "Prunus", "species": "persica" }
```

### @Security Decorator

The @Security decorator allow us to define a authorization for a given endpoint.
Security is using [passport](https://github.com/jaredhanson/passport) and it can be configured using
`passportAuth` method in `Server`

```typescript
Server.passportAuth(strategy, roleKey, options);
```

- strategy: is part of passport configuration
- roleKey: by default "*roles*", it is part of user object format
- options: by default an empty object of type passport.AuthenticateOptions. Allows configuration of passport configuration such as session, successRedirect or failureRedirect etc.

Some examples:

```typescript
@Security()
class HelloService {
    @Security("ROLE_ADMIN")
    admin() {}

    authorized() {}
}
```

```typescript
@Security("ROLE_USER")
class TestService {
}
```

```typescript
@Security(["ROLE_ADMIN", "ROLE_USER"])
class AuthService {
}
```

### Http Methods

We have decorators for each HTTP method. Theses decorators are used on service methods already bound
to a Path route to specify the endpoint at which requests can be made.

The following decorators can be used:

  - @GET 
  - @POST
  - @PUT
  - @PATCH
  - @DELETE
  - @OPTIONS
  - @HEAD

Some examples:

```typescript
@Path("/users")
class UserService {
   @GET
   getUsers(): Promise<Array<User>> {
      //...
   }

   @GET
   @Path(":userId")
   getUser(@PathParam("userId")): Promise<User> {
      //...
   }

   @PUT
   @Path(":userId")
   saveUser(@PathParam("userId"), user: User): void {
      //...
   }
}
```

Only methods decorated with one of this HTTP method decorators are exposed as handlers for 
requests on the server.

A single method can only be decorated with one of those decorators at a time.

### Parameters

There are decorators to map parameters to arguments on service methods. Each decorator can map a
differente kind of parameter on request.

The following decorators are available:

Decorator | Description
--------- | -----------
@PathParam | Parameter in requested URL path 
@QueryParam | Parameter in the query string 
@FormParam | Parameter in an HTML form 
@HeaderParam | Parameter in the request header
@CookieParam | Parameter in a cookie  
@FileParam | A File in a multipart form  
@FilesParam | An array of Files in a multipart form  
@Param | Parameter in the query string or in an HTML form
 
Some examples:

```typescript
@Path("/sample")
class Sample {
   @GET
   test(@QueryParam("limit") limit:number, @QueryParam("skip") skip:number) {
      //...
      // GET http://domain/sample?limit=5&skip=10
   }

   @POST
   test(@FormParam("name") name:string) {
      //...
      // POST http://domain/sample
      // body: name=joe
   }

   @POST
   @Path("upload")
   testUploadFile( @FileParam("myFile") file: Express.Multer.File, 
                   @FormParam("myField") myField: string) {
      //...
      /* POST http://domain/sample/upload
      Content-Type: multipart/form-data; boundary=AaB03x

      --AaB03x
      Content-Disposition: form-data; name="myField"

      Field Value
      --AaB03x
      Content-Disposition: form-data; name="myFile"; filename="file1.txt"
      Content-Type: text/plain

      ... contents of file1.txt ...
      --AaB03x--
      */
   }
}
```

An argument that has no decorator is handled as a json serialized entity in the request body 

```typescript
@Path("/sample")
class Sample {
   @POST
   test(user: User) {
      //...
      // POST http://domain/sample
      // body: a json representation of the User object
   }
}
```

The ``` @*Param ``` decorators can also be used on service class properties.  

An example:

```typescript
 @Path("users/:userId/photos")
 class TestService {
   @PathParam('userId')
   userId: string;

   @GET
   getPhoto(@PathParam('photoId')) {
      // Get the photo and return
   }
 }
```


### Service Context

A Context object is created to group informations about the current request being handled.
This Context can be accessed by service methods.

The Context is represented by the ``` ServiceContext ``` class and has the following properties:

Property | Type | Description
-------- | ---- | -----------
request | express.Request | The request object 
response | express.Response | The response object 
language | string | The resolved language to be used to handle the current request.  
accept | string | The preferred media type to be used to respond the current request. 
next | express.NextFunction | The next function. It can be used to delegate to the next middleware registered the processing of the current request. 


See [Types and languages](#types-and-languages) to know how the language and accept fields are calculated.

The ``` @Context ``` decorator can be used on service method's arguments or on service class properties to bind 
the argument or the property to the current context object.  

A Context usage example:

```typescript
 @Path("context")
 class TestService {
   @Context
   context: ServiceContext;

   @GET
   sayHello() {
      switch (this.context.language) {
         case "en":
            return "Hello";
         case "pt":
            return "Olá";
      }
      return "Hello";
   }
 }
```

We can use the decorator on method arguments too:

```typescript
 @Path("context")
 class TestService {

   @GET
   sayHello(@Context context: ServiceContext) {
      switch (context.language) {
         case "en":
            return "Hello";
         case "pt":
            return "Olá";
      }
      return "Hello";
   }
 }
```

You can use, also, one of the other decorators to access directly one of 
the Context property. It is a kind of suggar syntax.

  - @ContextRequest: To access ServiceContext.request
  - @ContextResponse: To access ServiceContext.response
  - @ContextNext: To access ServiceContext.next
  - @ContextLanguage: To access ServiceContext.language
  - @ContextAccept: To access ServiceContext.accept

```typescript
 @Path("context")
 class TestService {

   @GET
   sayHello(@ContextLanguage language: string) {
      switch (language) {
         case "en":
            return "Hello";
         case "pt":
            return "Olá";
      }
      return "Hello";
   }
 }
```

### Service Return

This library can receive the return of your service method and handle the serialization of the response as long as
handle the correct content type of your result and the response status codes to be sent.

When a primitive type is returned by a service method, it is sent as a plain text into the response body.

```typescript
@GET
sayHello(): string {
  return "Hello";
}
```

The response will contains only the String ``` Hello ``` as a plain text 

When an object is returned, it is sent as a json serialized string into the response body.

```typescript
@GET
@Path(":id")
getPerson(@PathParam("id") id: number): Person {
  return new Person(id);
}
```

The response will contains the person json serialization (ex: ``` {id: 123} ```. The response 
will have a ```application/json``` context type. 

When the method returns nothing, an empty body is sent withh a ```204``` status code.

```typescript
@POST
test(myObject: MyClass): void {
  //...
}
```

We provide also, some special types to inform that a reference to a resource is returned and 
that the server should handle it properly.

Type | Description
---- | -----------
NewResource | Inform that a new resource was created. Server will add a Location header and set status to 201 
RequestAccepted | Inform that the request was accepted but is not completed. A Location header should inform the location where the user can monitor his request processing status. Server will set the status to 202 
MovedPermanently | Inform that the resource has permanently moved to a new location, and that future references should use a new URI with their requests. Server will set the status to 301 
MovedTemporarily | Inform that the resource has temporarily moved to another location, but that future references should still use the original URI to access the resource. Server will set the status to 302 


```typescript
import {Return} from "typescript-rest";

@Path("test")
class TestService {
   @POST
   test(myObject: MyClass, @ContextRequest request: express.Request): Return.NewResource<void> {
      //...
      return new Return.NewResource<void>(req.url + "/" + generatedId);
   }

   @POST
   testWithBody(myObject: MyClass, @ContextRequest request: express.Request): Return.NewResource<string> {
      //...
      return new Return.NewResource<string>(req.url + "/" + generatedId, 'The body of the response');
   }
}
```

The server will return an empty body with a ```201``` status code and a ```Location``` header pointing to 
the URL of the created resource. 

It is possible to specify a body to be sent in responses:

```typescript
import {Return} from "typescript-rest";

interface NewObject {
  id: string;
}

@Path("test")
class TestService {
   @POST
   test(myObject: MyClass, @ContextRequest request: express.Request): Return.NewResource<NewObject> {
      //...
      return new Return.NewResource<NewObject>(req.url + "/" + generatedId, {id: generatedId}); //Returns a JSON on body {id: generatedId}
   }
}
```


You can use special types to download files:

Type | Description
---- | -----------
DownloadResource | Used to reference a resource (by its fileName) and download it
DownloadBinaryData | Used to return a file to download, based on a Buffer object

For example: 

```typescript
import {Return} from "typescript-rest";

@Path("download")
class TestDownload {
  @GET
  testDownloadFile(): Return.DownloadResource {
    return new Return.DownloadResource(__dirname +'/test-rest.spec.js', '/test-rest.spec.js');
  }

  @GET
  testDownloadFile(): Promise<Return.DownloadBinaryData> {
    return new Promise<Return.DownloadBinaryData>((resolve, reject)=>{
      fs.readFile(__dirname + '/test-rest.spec.js', (err, data)=>{
        if (err) {
          return reject(err);
        }
        return resolve(new Return.DownloadBinaryData(data, 'application/javascript', 'test-rest.spec.js'))
      });
    });
  }
}
```


#### Asynchronous services

The above section shows how the types returned are handled by the Server. However, most of the previous examples are working
synchronously. The recommended way is to work asynchronously, for a better performance.

To work asynchronously, you can return a ```Promise``` on your service method. The above rules to handle return types 
applies to the returned promise resolved value.

Some examples:

```typescript
import {Return} from "typescript-rest";

@Path("async")
class TestService {
   @POST
   test(myObject: MyClass, @ContextRequest request: express.Request): Promise<Return.NewResource> {
      return new Promise<Return.NewResource>(function(resolve, reject){
         //...
         resolve(new Return.NewResource(req.url + "/" + generatedId));
      });
   }

   @GET
   testGet() {
      return new Promise<MyClass>(function(resolve, reject){
         //...
         resolve(new MyClass());
      });
   }
}
```

It is important to observe that you can inform your return type explicitly or not, as you can see 
in the above example.  

You can also use ```async``` and ```await```:

```typescript
@Path('async')
export class MyAsyncService {
    @GET
    @Path('test')
    async test( ) {
        let result = await this.aPromiseMethod();
        return result;
    }

    @GET
    @Path('test2')
    async test2( ) {
        try {
            let result = await this.aPromiseMethod();
            return result;
        } catch (e) {
            // log error here, if you want
            throw e;
        }
    }

    private aPromiseMethod() {
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                resolve('OK');
            }, 10);
        });
    }
}
```

### Errors

This library provide some Error classes to map the problems that you may want to report to your clients.


Type | Description
---- | -----------
BadRequestError | Used to report errors with status code 400. 
UnauthorizedError | Used to report errors with status code 401. 
ForbiddenError | Used to report errors with status code 403. 
NotFoundError | Used to report errors with status code 404. 
MethodNotAllowedError | Used to report errors with status code 405. 
NotAcceptableError | Used to report errors with status code 406. 
ConflictError | Used to report errors with status code 409. 
InternalServerError | Used to report errors with status code 500. 
NotImplementedError | Used to report errors with status code 501. 

If you throw any of these errors on a service method, the server you log the 
problem and send a response with the appropriate status code an the error message on its body.

```typescript
import {Errors} from "typescript-rest";

@Path("async")
class TestService {
   @GET
   @Path("test1")
   testGet() {
      return new Promise<MyClass>(function(resolve, reject){
         //...
      throw new Errors.NotImplementedError("This operation is not available yet");
      });
   }

   @GET
   @Path("test2")
   testGet2() {
      return new Promise<MyClass>(function(resolve, reject){
         //...
         reject(new Errors.NotImplementedError("This operation is not available yet"));
      });
   }

   @GET
   @Path("test3")
   testGet3() {
      throw new Errors.NotImplementedError("This operation is not available yet");
   }
}
```

All the three operations above will return a response with status code ```501``` and a message on the body
```This operation is not available yet```

If you want to create a custom error that report your own status code, just extend the base class ```HttpError```.


```typescript
import {HttpError} from "typescript-rest";

class MyOwnError extends HttpError {
  static myNoSenseStatusCode: number = 999;
  constructor(message?: string) {
    super("MyOwnError", MyOwnError.myNoSenseStatusCode, message);
  }
}
```

You must remember that all uncaught errors are handled by a expressjs [error handler](http://expressjs.com/en/guide/error-handling.html#the-default-error-handler). You could want to customize it to allow you to inform how the errors will be delivered to your users. For more on this (for those who wants, for example, to send JSON errors), take a look at [this question](https://github.com/thiagobustamante/typescript-rest/issues/16);

### BodyParser Options

If you need to inform any options to the body parser, you can use the @BodyOptions decorator.

You can inform any property accepted by [bodyParser](https://www.npmjs.com/package/body-parser)

For example:
```typescript
import {HttpError} from "typescript-rest";

import {Errors} from "typescript-rest";

@Path("async")
class TestService {
   @POST
   @Path("test1")
   @BodyOptions({limit:'100kb'})
   testPost(myData) {
      return new Promise<MyClass>(function(resolve, reject){
         //...
         throw new Errors.NotImplementedError("This operation is not available yet");
      });
   }

   @GET
   @Path("test2")
   @BodyOptions({extended:false})
   testPost2(@FormParam("field1")myParam) {
      return new Promise<MyClass>(function(resolve, reject){
         //...
         reject(new Errors.NotImplementedError("This operation is not available yet"));
      });
   }

   @GET
   @Path("test3")
   testGet3() {
      throw new Errors.NotImplementedError("This operation is not available yet");
   }
}
```

It can be used, for example, to inform the bodyParser that it must handle date types for you:

```typescript
function dateReviver(key, value) {
    let a;
    if (typeof value === 'string') {
        a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
        if (a) {
            return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
        }
    }
    return value;
}

@Path('test')
class MyRestService {
   @POST
   @BodyOptions({reviver: dateReviver})
   myHandler(param) {
      //...
   }
} 
```

### Types and languages

It is possible to use decorators to inform the server which languages or mime types are supported by each service method.

These decorators can be used on the service class or on a service method (or both).

The following decorators are available:

Decorator | Description
--------- | -----------
AcceptLanguage | Tell the [[Server]] that a class or a method should only accept requests from clients that accepts one of the supported languages. 
Accept | Tell the [[Server]] that a class or a method should only accept requests from clients that accepts one of the supported mime types. 
 
See some examples:

```typescript
@Path("test")
@AcceptLanguage("en", "pt-BR")
class TestAcceptService {
  @GET
  testLanguage(@ContextLanguage language: string): string {
    if (language === 'en') {
      return "accepted";
    }
    return "aceito";
  }
}
```

In the above example, we declare that only ```English``` and ```Brazilian Portuguese``` are supported. 
The order here is important. That declaration says that our first language is ```English```. So, if nothing
was specified by the request, or if these two languages has the same weight on the 
resquest ```Accept-Language``` header, ```English``` will be the choice.  

If the request specifies an ```Accept-Language``` header, we will choose the language that best fit the
header value, considering the list of possible values declared on ```@AcceptLanguage``` decorator.

If none of our possibilities is good for the ```Accept-Language``` header in the request, the server 
throws a ```NotAcceptableError``` and returns a ```406``` status code for the client.

You can decorate methods too, like:

```typescript
@Path("test")
@AcceptLanguage("en", "pt-BR")
class TestAcceptService {
  @GET
  @AcceptLanguage("fr")
  testLanguage(@ContextLanguage language: string): string {
    // ...
  }
}
```

On the above example, the list of accepted languages will be ```["en", "pt-BR", "fr"]```, in that order.

The ```@Accept``` decorator works exaclty like ```@AcceptLanguage```, but it inform the server about the mime type
that a service can provide. It uses the ```Accept``` header in the request to decide about the preferred media to use.

```typescript
@Path("test")
@Accept("application/json")
class TestAcceptService {
  @GET
  testType(@ContextAccept accept: string): string {
     //...
  }
}
```

### IoC

It is possible to delegate to [typescript-ioc](https://github.com/thiagobustamante/typescript-ioc) the instantiation of the service objects.

First, install typescript-ioc:

```sh
npm install --save typescript-ioc
```


Then, you can configure it in two ways:

  1. Create a file called ```rest.config``` and put it on the root of your project:

```json
{
   "useIoC": true
}

```

or 

  2. Proggramatically. Ensure that you call ```Server.useIoC()``` in the begining of your code, before any service declaration


```typescript
/* Ensure to call Server.useIoC() before your service declarations. 
It only need to be called once */
Server.useIoC();

@AutoWired
class HelloService {
  sayHello(name: string) {
    return "Hello " + name;
  }
}

@Path("/hello")
@AutoWired
class HelloRestService {
  @Inject
  private helloService: HelloService;

  @Path(":name")
  @GET
  sayHello( @PathParam('name') name: string): string {
    return this.sayHello(name);
  }
}
```


It is also possible to inform a custom serviceFactory to instantiate your services. To do this, 
call ```Server.registerServiceFactory()``` instead of ```Server.useIoC()``` and provide your own ServiceFactory implementation.

You can also use the ```serviceFactory``` property in rest.config file to configure it:


```json
{
   "serviceFactory": "./myServiceFactory"
}
```

And export as default your serviceFactory class on ```./myServiceFactory.ts``` file.

It could be used to allow the usage of other libraries, like [Inversify](http://inversify.io/).


### Inheritance and abstract services

It is possible to extends services like you do with normal typescript classes:

```typescript
@Path('users')
class Users{
  @GET
  getUsers() {
    return [];
  }
}

@Path('superusers')
class SuperUsers{
  @GET
  @Path('privilegies')
  getPrivilegies() {
    return [];
  }
}
```

It will expose the following endpoints:

 - ```GET http://<my-host>/users```
 - ```GET http://<my-host>/superusers```
 - ```GET http://<my-host>/superusers/privilegies```

**A note about abstract classes**

A common scenario is to create an abstract class that contains some methods to be inherited by other concrete classes, like:

```typescript
abstract class MyCrudService<T> {

  @GET
  @Path(':id')
  abstract getEntity(): Promise<T>;
}

@Path('users')
class MyUserService<User> {

  @GET
  @Path(':id')
  async getEntity(): Promise<User> {
    return myUser;
  }
}
```

MyCrudService, in this scenario, is a service class that contains some exposed methods (methods that are declared to be exposed as endpoints). However, the intent here is not to expose the method for MyCrudService directly (I don't want an endpoint ```GET http://<myhost>/123``` exposed). We want that only its sublclasses have the methods exposed (```GET http://<myhost>/users/123```).

The fact that MyCrudService is an abstract class is not enough to typescript-rest library realize that its methods should not be exposed (Once it is compiled to javascript, it becomes a regular class). So you need to explicitly specify that this class should not expose any endpoint directly. It can be implemented using the ```@Abstract``` decorator:

```typescript
@Abstract
abstract class MyCrudService<T> {

  @GET
  @Path(':id')
  abstract getEntity(): Promise<T>;
}

@Path('users')
class MyUserService<User> {

  @GET
  @Path(':id')
  async getEntity(): Promise<User> {
    return myUser;
  }
}
```

Even if MyCrudService was not a typescript abstract class, if it is decorated with ```@Abstract```, its methods will not be exposed as endpoints.

If you don't want to use ```@Abstract```, another way to achieve the same goal is to specify which services you want to expose:

```typescript
let app: express.Application = express();
Server.buildServices(app, MyUserService);
```

or 

```typescript
let app: express.Application = express();
Server.loadServices(apis, 'lib/controllers/apis/impl/*');
```

### Preprocessors

It is possible to add a function to process the request before the handler on an endpoint by endpoint basis. This can be used to add a validator or authenticator to your application without including it in the body of the handler.

```typescript
function validator(req: express.Request): express.Request {
  if (req.body.userId != undefined) {
    throw new Errors.BadRequestError("userId not present");
  } else {
    req.body.user = Users.get(req.body.userId)
    return req
  }
}

@Path('users')
export class UserHandler {
  
  @Path('email')
  @POST
  @Preprocessor(validator)
  setEmail(body: any) {
    // will have body.user
  }
}
```

Preprocessors can also be added to a class, applying it to all endpoints on the class

```typescript
@Path('users')
@Preprocessor(validator)
export class UserHandler {
  
  @Path('email')
  @POST
  setEmail(body: any) {
    // will have body.user
  }
}
```

## Swagger

Typescript-rest can expose an endpoint with the [swagger](http://swagger.io/) documentation for your API.

For example: 

```typescript
let app: express.Application = express();
app.set('env', 'test');
Server.buildServices(app);
Server.swagger(app, './test/data/swagger.yaml', '/api-docs', 'localhost:5674', ['http']);
```

You can provide your swagger file as an YAML or a JSON file.

Now, just access: 

```
http://localhost:5674/api-docs  // Show the swagger UI to allow interaction with the swagger file
http://localhost:5674/api-docs/json  // Return the swagger.json file
http://localhost:5674/api-docs/yaml  // Return the swagger.yaml file
```

If needed, you can provide options to customize the Swagger UI:

```typescript
const swaggerUiOptions = {
  customSiteTitle: 'My Awesome Docs',
  swaggerOptions: {
    validatorUrl: null,
    oauth2RedirectUrl: 'http://example.com/oauth2-redirect.html',
    oauth: {
      clientId: 'my-default-client-id'
    }
  }
};
Server.swagger(app, './swagger.yaml', '/api-docs', undefined, ['http'], swaggerUiOptions);
```

> See [`swagger-ui-express`](https://github.com/scottie1984/swagger-ui-express) for more options and [`swagger-ui`](https://github.com/swagger-api/swagger-ui/blob/master/docs/usage/configuration.md) for more `swaggerOptions`. Note: Not all `swagger-ui` options are supported. Specifically, any options with a `Function` value will not work.

To generate the swagger file, you can use the [typescript-rest-swagger](https://github.com/thiagobustamante/typescript-rest-swagger) tool.

```sh
npm install typescript-rest-swagger -g
````

```sh
swaggerGen -c ./swaggerConfig.json
```

[typescript-rest-swagger](https://github.com/thiagobustamante/typescript-rest-swagger) tool can generate a swagger file as an YAML or a JSON file.

# Breaking Changes

Starting from version 1.0.0, it is required to inform the body type on all ReferencedResources, like:

```typescript
interface NewObject {
   id: string;
}

class TestService {
     @POST
    test(myObject: MyClass): Return.NewResource<NewObject> {
        //...
       return new Return.NewResource<NewObject>(req.url + "/" + generatedId, {id: generatedId}); //Returns a JSON on body {id: generatedId}
     }
  }
```

Even when you do not provide a body on a ReferencedResouce, you need to inform ```<void>```

```typescript
class TestService {
     @POST
    test(myObject: MyClass): Return.RequestAccepted<void> {
        //...
       return new Return.RequestAccepted<void>(req.url + "/" + generatedId);
     }
  }
```
