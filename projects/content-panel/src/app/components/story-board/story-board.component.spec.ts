import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryBoardComponent } from './story-board.component';

describe('StoryBoardComponent', () => {
  let component: StoryBoardComponent;
  let fixture: ComponentFixture<StoryBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoryBoardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoryBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
