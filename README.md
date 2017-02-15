# REST Services for Typescript
This is a lightweight annotation-based [expressjs](http://expressjs.com/) extension for typescript.

It can be used to define your APIs using ES7 decorators.

**Table of Contents** 

- [REST Services for Typescript](#)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Basic Usage](#basic-usage)
  - [Complete Guide](#complete-guide)
    - [Server](#server)
    - [@Path Decorator](#path-decorator)
      - [Path Parameters](#path-parameters)
    - [Http Methods](#http-methods)
    - [Parameters](#parameters)
    - [Service Context](#service-context)
    - [Service Return](#service-return)
      - [Asynchronous services](#asynchronous-services)
    - [Errors](#errors)
    - [Types and languages](#types-and-languages)
    - [IoC](#ioc)

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


See [Types and languages](#types-and-languages) to know how the language and preferredMedia fields are calculated.

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
getPerson(@PathParam(":id") id: number): Person {
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
   test(myObject: MyClass, @ContextRequest request: express.Request): Return.NewResource {
      //...
      return new Return.NewResource(req.url + "/" + generatedId);
   }
}
```

The server will return an empty body with a ```201``` status code and a ```Location``` header pointing to 
the URL of the created resource. 

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

The above section shows how the types returned are handled by the Server. However, all the previous examples are working
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

### Errors

This library provide some Error classes to map the problems that you may want to report to your clients.


Type | Description
---- | -----------
BadRequestError | Used to report errors with status code 400. 
UnauthorizedError | Used to report errors with status code 401. 
ForbidenError | Used to report errors with status code 403. 
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

You ca configure it in two ways:
  1. Ensure that you call ```Server.useIoC()``` in the begining of your code, before any service declaration, or
  2. Create a file called ```rest.config``` and put it on the root of your project:



```typescript
/*Ensure to call Server.useIoC() before your service declarations. 
It only need to be called once*/
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

or Configure a rest.config file:

```json
{
   "useIoC": true
}

```

It is also possible to inform a custom serviceFactory to instantiate your services. To do this, 
call ```Server.registerServiceFactory()``` instead of ```Server.useIoC()``` and provide your own ServiceFactory implementation.

You can also use the ```serviceFactory``` property on rest.config file to configure it:


```json
{
   "serviceFactory": "./myServiceFactory"
}
```

And export as default your serviceFactory class on ```./myServiceFactory.ts``` file.

It could be used to allow other libraries, like [Inversify](http://inversify.io/).

