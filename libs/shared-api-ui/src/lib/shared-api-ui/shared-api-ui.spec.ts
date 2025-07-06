import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedApiUi } from './shared-api-ui';

describe('SharedApiUi', () => {
  let component: SharedApiUi;
  let fixture: ComponentFixture<SharedApiUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedApiUi],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedApiUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
