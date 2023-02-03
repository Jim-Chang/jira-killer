import { TopPanelComponent } from './top-panel.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('TopPanelComponent', () => {
  let component: TopPanelComponent;
  let fixture: ComponentFixture<TopPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TopPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
