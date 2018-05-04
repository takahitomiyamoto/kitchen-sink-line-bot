import { Container, inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
// import 'reflect-metadata';

let container = new Container();

export { container, provide, inject };