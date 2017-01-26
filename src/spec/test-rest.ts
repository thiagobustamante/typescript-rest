"use strict";

import * as express from "express";
import * as request from 'request';
import * as fs from "fs";
import * as _ from "lodash";

import {Path, Server, GET, POST, PUT, DELETE, HttpMethod,
		PathParam, QueryParam, CookieParam, HeaderParam, 
		FormParam, Param, Context, ServiceContext, ContextRequest, 
		ContextResponse, ContextLanguage, ContextAccept, 
		ContextNext, AcceptLanguage, Accept, FileParam, 
		Errors, Return} from "../lib/typescript-rest";

class Person {
	constructor(id: number, name: string, age: number) {
		this.id = id;
		this.name = name;
		this.age = age;
	}
	id: number;
	name: string;
	age: number;
}

@Path("mypath")
class MyService {
	@GET
	test( ): string {
		return "OK";
	}

	@GET
	@Path("secondpath")
	test2( ): string {
		return "OK";
	}
}

@Path("mypath2")
class MyService2 {
	@GET
	@Path("secondpath")
	test( ): string {
		return "OK";
	}
}

@Path("/asubpath/person")
class PersonService {
	@Path(":id")
	@GET
	getPerson( @PathParam('id') id: number): Promise<Person> {
		return new Promise<Person>(function(resolve, reject){
			resolve(new Person(id, "Fulano de Tal número " + id.toString(), 35));
		});
	}

	@PUT
	@Path("/:id")
	setPerson( person: Person): boolean {
		return true;
	}

	@POST
	addPerson(@ContextRequest req: express.Request, person: Person): Return.NewResource {
		return new Return.NewResource(req.url + "/" + person.id);
	}

	@GET
	getAll( @QueryParam('start') start: number, 
		    @QueryParam('size') size: number): Person[] {
		let result: Array<Person> = new Array<Person>();

		for (let i: number = start; i < (start + size); i++) {
			result.push(new Person(i, "Fulano de Tal número " + i.toString(), 35));
		}
		return result;
	}
}

class TestParams {
	
	@Context
	context: ServiceContext;

	@GET
	@Path("headers")
	testHeaders( @HeaderParam('my-header') header: string,
				 @CookieParam('my-cookie') cookie: string): string {
		return "cookie: " + cookie + "|header: "+header;
	}

	@POST
	@Path("multi-param")
	testMultiParam( @Param('param') param: string): string {
		return param;
	}

	@GET
	@Path("context")
	testContext( @QueryParam('q') q: string,
		@ContextRequest request: express.Request,
		@ContextResponse response: express.Response,
		@ContextNext next: express.NextFunction): void {

		if (request && response && next) {
			response.status(201);
			if (q === "123") {
				response.send(true);
			}
			else{
				response.send(false);
			}
		}
	}

	@POST
	@Path("upload")
	testUploadFile( @FileParam("myFile") file: Express.Multer.File, 
					@FormParam("myField") myField: string): boolean {
		return (file 
		 && (_.startsWith(file.buffer.toString(),'"use strict";')) 
	     && (myField === "my_value"));
	}
}

@Path("download")
class TestDownload {
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

@Path("/accept")
@AcceptLanguage("en", "pt-BR")
class AcceptTest {

	@GET
	testLanguage(@ContextLanguage language: string): string {
		if (language === 'en') {
			return "accepted";
		}
		return "aceito";
	}

	@GET
	@Path("types")
	@Accept("application/json")
	testAccepts(@ContextAccept type: string): string {
		if (type === 'application/json') {
			return "accepted";
		}
		return "not accepted"
	}

	@PUT
	@Path("conflict")
	testConflict(): string {
		throw new Errors.ConflictError("test of conflict");
	}


	@POST
	@Path("conflict")
	testConflictAsync(): Promise<string> {
		return new Promise<string>(function(resolve, reject){
			throw new Errors.ConflictError("test of conflict");
		});
	}
}

let app: express.Application = express();
app.set('env', 'test');
Server.buildServices(app);
//Server.buildServices(app, PersonService, TestParams, AcceptTest);

let server;
describe("Server Tests", () => {

	beforeAll(function(){
		server = app.listen(5674);
	});

	afterAll(function(){
		server.close();
	});

	describe("Server", () => {
		it("should provide a catalog containing the exposed paths", () => {
			expect(Server.getPaths().indexOf("/mypath")).toBeGreaterThan(-1);
			expect(Server.getPaths().indexOf("/mypath2/secondpath")).toBeGreaterThan(-1);			
			expect(Server.getPaths().indexOf("/asubpath/person/:id")).toBeGreaterThan(-1);
			expect(Server.getPaths().indexOf("/headers")).toBeGreaterThan(-1);
			expect(Server.getPaths().indexOf("/multi-param")).toBeGreaterThan(-1);
			expect(Server.getPaths().indexOf("/context")).toBeGreaterThan(-1);
			expect(Server.getPaths().indexOf("/upload")).toBeGreaterThan(-1);
			expect(Server.getPaths().indexOf("/download")).toBeGreaterThan(-1);
			expect(Server.getHttpMethods("/asubpath/person/:id").indexOf(HttpMethod.GET)).toBeGreaterThan(-1);
			expect(Server.getHttpMethods("/asubpath/person/:id").indexOf(HttpMethod.PUT)).toBeGreaterThan(-1);
			expect(Server.getPaths().indexOf("/accept")).toBeGreaterThan(-1);
			expect(Server.getPaths().indexOf("/accept/conflict")).toBeGreaterThan(-1);
		});
	});

	describe("PersonService", () => {
		it("should return the person (123) for GET on path: /asubpath/person/123", (done) => {
			request("http://localhost:5674/asubpath/person/123", function(error, response, body) {
				let result: Person = JSON.parse(body);
				expect(result.id).toEqual(123);
				done();
			});
		});
	
		it("should return true for PUT on path: /asubpath/person/123", (done) => {
			request.put({ 
				headers: { 'content-type': 'application/json' },
				url: "http://localhost:5674/asubpath/person/123", 
				body: JSON.stringify(new Person(123, "Fulano de Tal número 123", 35))
			}, function(error, response, body) {
				expect(body).toEqual("true");
				done();
			});
		});

		it("should return 201 for POST on path: /asubpath/person", (done) => {
			request.post({ 
				headers: { 'content-type': 'application/json' },
				url: "http://localhost:5674/asubpath/person", 
				body: JSON.stringify(new Person(123, "Fulano de Tal número 123", 35))
			}, function(error, response, body) {
				expect(response.statusCode).toEqual(201);
				expect(response.headers['location']).toEqual("/asubpath/person/123");
				done();
			});
		});

		it("should return an array with 3 elements for GET on path: /asubpath/person?start=0&size=3", (done) => {
			request("http://localhost:5674/asubpath/person?start=0&size=3", function(error, response, body) {
				let result: Array<Person> = JSON.parse(body);
				expect(result.length).toEqual(3);
				done();
			});
		});
	});

	describe("MyService", () => {
		it("should configure a path without an initial /", (done) => {
			request("http://localhost:5674/mypath", function(error, response, body) {
				expect(body).toEqual("OK");
				done();
			});
		});
	});

	describe("MyService2", () => {
		it("should configure a path on method ", (done) => {
			request("http://localhost:5674/mypath2/secondpath", function(error, response, body) {
				expect(body).toEqual("OK");
				done();
			});
		});		
	});


	describe("TestParams", () => {
		it("should parse header and cookies correclty", (done) => {
			request({
				headers: { 'my-header': 'header value', 'Cookie': 'my-cookie=cookie value' },
				url: "http://localhost:5674/headers"				
			}, function(error, response, body) {
				expect(body).toEqual("cookie: cookie value|header: header value");
				done();
			});
		});

		it("should parse multi param as query param", (done) => {
			request.post({
				url: "http://localhost:5674/multi-param?param=myQueryValue"				
			}, function(error, response, body) {
				expect(body).toEqual("myQueryValue");
				done();
			});
		});

		it("should parse multi param as form param", (done) => {
			let form = {
				'param': 'formParam'
			};
			let req = request.post({
					"url": "http://localhost:5674/multi-param",
					"form": form
				}, function(error, response, body) {
					expect(body).toEqual("formParam");
					expect(response.statusCode).toEqual(200);
					done();
			});
		});

		it("should accept Context parameters", (done) => {
			request({
				url: "http://localhost:5674/context?q=123"
			}, function(error, response, body) {
				expect(body).toEqual("true");
				expect(response.statusCode).toEqual(201);
				done();
			});
		});

		it("should accept file parameters", (done) => {
			let req = request.post("http://localhost:5674/upload", function(error, response, body) {
				expect(body).toEqual("true");
				expect(response.statusCode).toEqual(200);
				done();
			});
			let form: FormData = req.form();
			form.append('myField', 'my_value');
			form.append('myFile', fs.createReadStream(__dirname + '/test-rest.spec.js'), 'test-rest.spec.js');
		});
	});
	describe("TestDownload", () => {
		it("should return a file", (done) => {
			request({
				url: "http://localhost:5674/download"				
			}, function(error, response, body) {
				expect(response.headers['content-type']).toEqual('application/javascript');
				expect(_.startsWith(body.toString(),'"use strict";')).toEqual(true);
				done();
			});
		});
	});

	describe("AcceptTest", () => {
		it("should choose language correctly", (done) => {
			request({
				headers: { 'Accept-Language': 'pt-BR' },
				url: "http://localhost:5674/accept"				
			}, function(error, response, body) {
				expect(body).toEqual("aceito");
				done();
			});
		});

		it("should reject unacceptable languages", (done) => {
			request({
				headers: { 'Accept-Language': 'fr' },
				url: "http://localhost:5674/accept"				
			}, function(error, response, body) {
				expect(response.statusCode).toEqual(406);
				done();
			});
		});

		it("should use default language if none specified", (done) => {
			request({
				url: "http://localhost:5674/accept"				
			}, function(error, response, body) {
				expect(body).toEqual("accepted");
				done();
			});
		});

		it("should use default media type if none specified", (done) => {
			request({
				url: "http://localhost:5674/accept/types"				
			}, function(error, response, body) {
				expect(body).toEqual("accepted");
				done();
			});
		});
		it("should handle RestErrors", (done) => {
			request.put({
				headers: { 'Accept': 'text/html' },
				url: "http://localhost:5674/accept/conflict",				
			}, function(error, response, body) {
				expect(response.statusCode).toEqual(409);
				done();
			});
		});
		it("should handle RestErrors on Async calls", (done) => {
			request.post({
				headers: { 'Accept': 'text/html' },
				url: "http://localhost:5674/accept/conflict",				
			}, function(error, response, body) {
				expect(response.statusCode).toEqual(409);
				done();
			});
		});
		it("should reject unacceptable media types", (done) => {
			request({
				headers: { 'Accept': 'text/html' },
				url: "http://localhost:5674/accept/types"				
			}, function(error, response, body) {
				expect(response.statusCode).toEqual(406);
				done();
			});
		});

	});

	describe("Server", () => {
		it("should return 404 when unmapped resources are requested", (done) => {
			request({
				url: "http://localhost:5674/unmapped/resource"				
			}, function(error, response, body) {
				expect(response.statusCode).toEqual(404);
				done();
			});
		});

		it("should return 405 when a not supported method is requeted to a mapped resource", (done) => {
			request.post({
				url: "http://localhost:5674/asubpath/person/123"				
			}, function(error, response, body) {
				expect(response.statusCode).toEqual(405);
				let allowed: string = response.headers['allow'];
				expect(allowed).toContain("GET");
				expect(allowed).toContain("PUT");
				done();
			});
		});
	});

});

