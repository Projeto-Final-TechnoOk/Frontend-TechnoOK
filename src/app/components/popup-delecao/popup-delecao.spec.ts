import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupDelecao } from './popup-delecao';

describe('PopupDelecao', () => {
  let component: PopupDelecao;
  let fixture: ComponentFixture<PopupDelecao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupDelecao],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupDelecao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
