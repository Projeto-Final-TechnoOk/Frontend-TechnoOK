import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedidoresPage } from './medidores';

describe('Medidores', () => {
  let component: MedidoresPage;
  let fixture: ComponentFixture<MedidoresPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedidoresPage],
    }).compileComponents();

    fixture = TestBed.createComponent(MedidoresPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
