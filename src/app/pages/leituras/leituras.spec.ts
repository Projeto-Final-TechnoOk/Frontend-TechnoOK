import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeiturasPage } from './leituras';

describe('Leituras', () => {
  let component: LeiturasPage;
  let fixture: ComponentFixture<LeiturasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeiturasPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LeiturasPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
