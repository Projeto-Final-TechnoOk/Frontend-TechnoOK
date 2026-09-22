import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Medidor } from './medidor';

describe('Medidor', () => {
  let component: Medidor;
  let fixture: ComponentFixture<Medidor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Medidor],
    }).compileComponents();

    fixture = TestBed.createComponent(Medidor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
