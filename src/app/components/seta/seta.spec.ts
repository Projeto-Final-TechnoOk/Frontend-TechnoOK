import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Seta } from './seta';

describe('Seta', () => {
  let component: Seta;
  let fixture: ComponentFixture<Seta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Seta],
    }).compileComponents();

    fixture = TestBed.createComponent(Seta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
