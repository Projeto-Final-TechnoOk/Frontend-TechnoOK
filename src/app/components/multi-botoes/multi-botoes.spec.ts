import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiBotoes } from './multi-botoes';

describe('MultiBotoes', () => {
  let component: MultiBotoes;
  let fixture: ComponentFixture<MultiBotoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiBotoes],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiBotoes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
