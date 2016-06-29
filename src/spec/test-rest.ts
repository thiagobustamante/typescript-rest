/// <reference path="../../typings/index.d.ts" />

import * as express from "express";
import * as request from 'request';
import {Path, Server, GET, POST, PUT, DELETE, HttpMethod,
		PathParam, QueryParam, CookieParam, HeaderParam, 
		FormParam, Context} from "../typescript-rest";

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

@Path("/person")
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
	@GET
	@Path("headers")
	testHeaders( @HeaderParam('my-header') header: string,
				 @CookieParam('my-cookie') cookie: string): string {
		return "cookie: " + cookie + "|header: "+header;
	}

	@GET
	@Path("context")
	testContext( @QueryParam('q') q: string,
		@Context.Request request: express.Request,
		@Context.Response response: express.Response,
		@Context.Next next: express.NextFunction): void {

		if (request && response && next) {
			console.log("Funcionou: o parametro recebido é: "+request.query["q"]);

			response.status(201);
			if (q === "123") {
				response.send(true);
			}
			else{
				response.send(false);
			}
		}
	}
}

describe("Server", () => {
	it("should provide a catalog containing the exposed paths", () => {
		expect(Server.getPaths().has("/person/:id")).toEqual(true);
		expect(Server.getPaths().has("/headers")).toEqual(true);
		expect(Server.getPaths().has("/context")).toEqual(true);
		expect(Server.getHttpMethods("/person/:id").has(HttpMethod.GET)).toEqual(true);
		expect(Server.getHttpMethods("/person/:id").has(HttpMethod.PUT)).toEqual(true);
	});
});

let app: express.Application = express();
Server.buildServices(app);

app.listen(3000, function() {
	console.log('Test app listening on port 3000!');

	describe("PersonService", () => {
		it("should return the person (123) for GET on path: /person/123", (done) => {
			request("http://localhost:3000/person/123", function(error, response, body) {
				console.log("Cliente");
				console.log(body);
				let result: Person = JSON.parse(body);
				expect(result.id).toEqual(123);
				done();
			});
		});
	
		it("should return true for PUT on path: /person/123", (done) => {
			request.put({ 
				headers: { 'content-type': 'application/json' },
				url: "http://localhost:3000/person/123", 
				body: JSON.stringify(new Person(123, "Fulano de Tal número 123", 35))
			}, function(error, response, body) {
				expect(body).toEqual("true");
				done();
			});
		});

		it("should return the an array with 3 elements for GET on path: /person?start=0&size=3", (done) => {
			request("http://localhost:3000/person?start=0&size=3", function(error, response, body) {
				let result: Array<Person> = JSON.parse(body);
				expect(result.length).toEqual(3);
				done();
			});
		});
	});

	describe("TestParams", () => {
		it("should parse header and cookies correclty", (done) => {
			request({
				headers: { 'my-header': 'header value', 'Cookie': 'my-cookie=cookie value' },
				url: "http://localhost:3000/headers"				
			}, function(error, response, body) {
				expect(body).toEqual("cookie: cookie value|header: header value");
				done();
			});
		});

		it("should accept Context parameters", (done) => {
			request({
				url: "http://localhost:3000/context?q=123"
			}, function(error, response, body) {
				expect(body).toEqual("true");
				expect(response.statusCode).toEqual(201);
				done();
			});
		});
	});

	// process.exit();
});

