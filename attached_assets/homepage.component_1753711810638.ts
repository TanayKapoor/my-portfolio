import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-homepage',
  imports: [],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit, OnDestroy, AfterViewInit {
  
  // Greeting messages to cycle through
  greetingMessages: string[] = [
    "Hi, the name's Tanay.",
    "i_like_to_code.py",
    "full_stack_wizard.js",
    "building_cool_things_since_2020",
    "and I'm addicted to tea."
  ];
  
  currentText: string = '';
  currentMessageIndex: number = 0;
  isTyping: boolean = true;
  showCursor: boolean = true;
  
  private typewriterInterval?: ReturnType<typeof setInterval>;
  private cursorInterval?: ReturnType<typeof setInterval>;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startTypewriterAnimation();
      this.startCursorBlink();
    }
  }
  
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupScrollObserver();
    }
  }
  
  ngOnDestroy(): void {
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
    }
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
    }
  }
  
  private startTypewriterAnimation(): void {
    const typingSpeed = 150; // milliseconds per character
    const backspaceSpeed = 75; // milliseconds per character when backspacing
    const pauseBetweenMessages = 2000; // pause before starting backspace
    
    const typeMessage = () => {
      let charIndex = 0;
      let currentMessage = this.greetingMessages[this.currentMessageIndex];
      this.isTyping = true;
      
      // Clear any existing interval
      if (this.typewriterInterval) {
        clearInterval(this.typewriterInterval);
      }
      
      this.typewriterInterval = setInterval(() => {
        if (this.isTyping) {
          // Typing forward
          if (charIndex < currentMessage.length) {
            this.currentText = currentMessage.substring(0, charIndex + 1);
            charIndex++;
          } else {
            // Finished typing, wait then start backspacing
            clearInterval(this.typewriterInterval!);
            setTimeout(() => {
              this.isTyping = false;
              this.startBackspacing(currentMessage, charIndex);
            }, pauseBetweenMessages);
          }
        }
      }, typingSpeed);
    };
    
    typeMessage();
  }
  
  private startBackspacing(message: string, startIndex: number): void {
    const backspaceSpeed = 75;
    let charIndex = startIndex;
    
    this.typewriterInterval = setInterval(() => {
      if (charIndex > 0) {
        charIndex--;
        this.currentText = message.substring(0, charIndex);
      } else {
        // Finished backspacing, move to next message
        clearInterval(this.typewriterInterval!);
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.greetingMessages.length;
        setTimeout(() => {
          this.startTypewriterAnimation();
        }, 500); // Small pause before starting next message
      }
    }, backspaceSpeed);
  }
  
  private startCursorBlink(): void {
    this.cursorInterval = setInterval(() => {
      this.showCursor = !this.showCursor;
    }, 600);
  }
  
  scrollToSection(sectionId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }
  
  private setupScrollObserver(): void {
    const aboutSection = document.querySelector('.about-content');
    
    if (aboutSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      });
      
      observer.observe(aboutSection);
    }
  }
}
