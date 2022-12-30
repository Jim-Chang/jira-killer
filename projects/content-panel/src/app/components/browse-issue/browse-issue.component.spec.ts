import { BrowseIssueComponent } from './browse-issue.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('BrowseIssueComponent', () => {
  let component: BrowseIssueComponent;
  let fixture: ComponentFixture<BrowseIssueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrowseIssueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
