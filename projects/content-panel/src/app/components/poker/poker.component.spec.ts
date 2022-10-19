import { PokerComponent } from './poker.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('PokerComponent', () => {
  let component: PokerComponent;
  let fixture: ComponentFixture<PokerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PokerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PokerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
