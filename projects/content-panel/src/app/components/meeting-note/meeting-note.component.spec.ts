import { MeetingNoteComponent } from './meeting-note.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('MeetingNoteComponent', () => {
  let component: MeetingNoteComponent;
  let fixture: ComponentFixture<MeetingNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeetingNoteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MeetingNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
