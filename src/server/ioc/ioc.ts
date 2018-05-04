import { Container, inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';

let container = new Container();

export { container, provide, inject };