import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingNotification } from './floating-notification';

describe('FloatingNotification', () => {
  let component: FloatingNotification;
  let fixture: ComponentFixture<FloatingNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingNotification],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
