import { TestBed } from '@angular/core/testing';
import { MedidoresService } from './medidores';

describe('Medidores', () => {
  let service: MedidoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedidoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
