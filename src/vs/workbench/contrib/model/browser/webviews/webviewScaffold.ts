/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/** Codicon SVGs used by Next Steps groups, keyed by codicon name (16px, theme-coloured via currentColor). */
const NEXT_STEP_CODICONS: Readonly<Record<string, string>> = {
	'arrow-swap': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M11.3536 1.64645C11.1583 1.45118 10.8417 1.45118 10.6464 1.64645C10.4512 1.84171 10.4512 2.15829 10.6464 2.35355L12.2929 4H2.5C2.22386 4 2 4.22386 2 4.5C2 4.77614 2.22386 5 2.5 5H12.2929L10.6464 6.64645C10.4512 6.84171 10.4512 7.15829 10.6464 7.35355C10.8417 7.54882 11.1583 7.54882 11.3536 7.35355L13.8536 4.85355C14.0488 4.65829 14.0488 4.34171 13.8536 4.14645L11.3536 1.64645ZM5.35355 9.35355C5.54882 9.15829 5.54882 8.84171 5.35355 8.64645C5.15829 8.45118 4.84171 8.45118 4.64645 8.64645L2.14645 11.1464C1.95118 11.3417 1.95118 11.6583 2.14645 11.8536L4.64645 14.3536C4.84171 14.5488 5.15829 14.5488 5.35355 14.3536C5.54882 14.1583 5.54882 13.8417 5.35355 13.6464L3.70711 12H13.5C13.7761 12 14 11.7761 14 11.5C14 11.2239 13.7761 11 13.5 11H3.70711L5.35355 9.35355Z"/></svg>',
	'beaker': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 0.998993C12.276 0.998993 12.5 1.22299 12.5 1.49899C12.5 1.77499 12.276 1.99899 12 1.99899H11.004V6.68299C11.004 7.26299 11.148 7.83299 11.423 8.34299L13.819 12.789C14.358 13.788 13.634 15.001 12.499 15.001H3.50101C2.36501 15.001 1.64301 13.788 2.18101 12.789L4.57501 8.34499C4.85001 7.83499 4.99401 7.26399 4.99401 6.68499V1.99899H4.00001C3.72401 1.99899 3.50001 1.77499 3.50001 1.49899C3.50001 1.22299 3.72401 0.998993 4.00001 0.998993H12ZM5.99401 1.99899V6.68599C5.99401 7.43099 5.80901 8.16399 5.45601 8.81999L4.82101 9.99899H11.18L10.543 8.81699C10.19 8.16099 10.005 7.42799 10.005 6.68199V1.99899H5.99401ZM11.718 10.999H4.28201L3.06201 13.263C2.88201 13.597 3.12401 14 3.50201 14H12.499C12.877 14 13.119 13.596 12.939 13.263L11.718 10.999Z"/></svg>',
	'briefcase': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M5 4V2.5C5 1.67157 5.67157 1 6.5 1H9.5C10.3284 1 11 1.67157 11 2.5V4H13C14.1046 4 15 4.89543 15 6V13C15 14.1046 14.1046 15 13 15H3C1.89543 15 1 14.1046 1 13V6C1 4.89543 1.89543 4 3 4H5ZM6 2.5V4H10V2.5C10 2.22386 9.77614 2 9.5 2H6.5C6.22386 2 6 2.22386 6 2.5ZM2 9.50018V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V9.50018C13.5822 9.81403 13.0628 10 12.5 10H9V10.5C9 10.7761 8.77614 11 8.5 11H7.5C7.22386 11 7 10.7761 7 10.5V10H3.5C2.9372 10 2.41783 9.81403 2 9.50018ZM7 9V8.5C7 8.22386 7.22386 8 7.5 8H8.5C8.77614 8 9 8.22386 9 8.5V9H12.5C13.3284 9 14 8.32843 14 7.5V6C14 5.44772 13.5523 5 13 5H3C2.44772 5 2 5.44772 2 6V7.5C2 8.32843 2.67157 9 3.5 9H7Z"/></svg>',
	'cloud-download': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M11.5 7C9.015 7 7 9.015 7 11.5C7 13.985 9.015 16 11.5 16C13.985 16 16 13.985 16 11.5C16 9.015 13.985 7 11.5 7ZM13.854 11.854L11.854 13.854C11.806 13.902 11.751 13.938 11.692 13.963C11.634 13.987 11.57 14 11.504 14.001H11.498C11.431 14.001 11.368 13.987 11.31 13.963C11.252 13.939 11.197 13.903 11.15 13.857L11.147 13.854L9.147 11.854C8.952 11.659 8.952 11.342 9.147 11.147C9.342 10.952 9.659 10.952 9.854 11.147L11 12.294V9.001C11 8.725 11.224 8.501 11.5 8.501C11.776 8.501 12 8.725 12 9.001V12.294L13.146 11.147C13.341 10.952 13.658 10.952 13.853 11.147C14.048 11.342 14.048 11.659 13.853 11.854H13.854ZM4.25 12H6V13H4.25C2.455 13 1 11.545 1 9.75C1 8.029 2.338 6.62 4.03 6.507C4.273 4.53 5.958 3 8 3C9.862 3 11.411 4.278 11.857 6H10.811C10.397 4.838 9.303 4 8 4C6.343 4 5 5.343 5 7C5 7.276 4.776 7.5 4.5 7.5H4.25C3.007 7.5 2 8.507 2 9.75C2 10.993 3.007 12 4.25 12Z"/></svg>',
	'credit-card': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M10.5 10C10.2239 10 10 10.2239 10 10.5C10 10.7761 10.2239 11 10.5 11H12.5C12.7761 11 13 10.7761 13 10.5C13 10.2239 12.7761 10 12.5 10H10.5ZM1 5.5C1 4.11929 2.11929 3 3.5 3H12.5C13.8807 3 15 4.11929 15 5.5V10.5C15 11.8807 13.8807 13 12.5 13H3.5C2.11929 13 1 11.8807 1 10.5V5.5ZM14 6V5.5C14 4.67157 13.3284 4 12.5 4H3.5C2.67157 4 2 4.67157 2 5.5V6H14ZM2 7V10.5C2 11.3284 2.67157 12 3.5 12H12.5C13.3284 12 14 11.3284 14 10.5V7H2Z"/></svg>',
	'database': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1C5.149 1 3 2.075 3 3.5V12.5C3 13.925 5.149 15 8 15C10.851 15 13 13.925 13 12.5V3.5C13 2.075 10.851 1 8 1ZM8 2C10.441 2 12 2.888 12 3.5C12 4.112 10.441 5 8 5C5.559 5 4 4.112 4 3.5C4 2.888 5.558 2 8 2ZM8 14C5.558 14 4 13.111 4 12.5V5.021C5.21405 5.71872 6.60095 6.05816 8 6C9.39905 6.05816 10.7859 5.71872 12 5.021V12.5C12 13.111 10.441 14 8 14Z"/></svg>',
	'diff': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M5.5 2H2.5C1.673 2 1 2.673 1 3.5V12.5C1 13.327 1.673 14 2.5 14H5.5C6.327 14 7 13.327 7 12.5V3.5C7 2.673 6.327 2 5.5 2ZM2.5 3H5.5C5.775 3 6 3.224 6 3.5V5H2V3.5C2 3.224 2.225 3 2.5 3ZM5.5 13H2.5C2.225 13 2 12.776 2 12.5V6H6V12.5C6 12.776 5.775 13 5.5 13ZM13.5 2H10.5C9.673 2 9 2.673 9 3.5V12.5C9 13.327 9.673 14 10.5 14H13.5C14.327 14 15 13.327 15 12.5V3.5C15 2.673 14.327 2 13.5 2ZM10.5 3H13.5C13.775 3 14 3.224 14 3.5V8H10V3.5C10 3.224 10.225 3 10.5 3ZM13.5 13H10.5C10.225 13 10 12.776 10 12.5V10H14V12.5C14 12.776 13.775 13 13.5 13Z"/></svg>',
	'edit': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M14.236 1.76386C13.2123 0.740172 11.5525 0.740171 10.5289 1.76386L2.65722 9.63549C2.28304 10.0097 2.01623 10.4775 1.88467 10.99L1.01571 14.3755C0.971767 14.5467 1.02148 14.7284 1.14646 14.8534C1.27144 14.9783 1.45312 15.028 1.62432 14.9841L5.00978 14.1151C5.52234 13.9836 5.99015 13.7168 6.36433 13.3426L14.236 5.47097C15.2596 4.44728 15.2596 2.78755 14.236 1.76386ZM11.236 2.47097C11.8691 1.8378 12.8957 1.8378 13.5288 2.47097C14.162 3.10413 14.162 4.1307 13.5288 4.76386L12.75 5.54269L10.4571 3.24979L11.236 2.47097ZM9.75002 3.9569L12.0429 6.24979L5.65722 12.6355C5.40969 12.883 5.10023 13.0595 4.76117 13.1465L2.19447 13.8053L2.85327 11.2386C2.9403 10.8996 3.1168 10.5901 3.36433 10.3426L9.75002 3.9569Z"/></svg>',
	'export': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1.5 2.99976C1.776 2.99976 2 3.22376 2 3.49976V11.4998C2 11.7758 1.776 11.9998 1.5 11.9998C1.224 11.9998 1 11.7758 1 11.4998V3.49976C1 3.22376 1.224 2.99976 1.5 2.99976ZM10.146 3.14576C10.341 2.95076 10.658 2.95076 10.853 3.14576L14.853 7.14576C15.048 7.34076 15.048 7.65776 14.853 7.85276L10.853 11.8528C10.658 12.0478 10.341 12.0478 10.146 11.8528C9.951 11.6578 9.951 11.3408 10.146 11.1458L13.293 7.99976H4.5C4.224 7.99976 4 7.77576 4 7.49976C4 7.22376 4.224 6.99976 4.5 6.99976H13.293L10.147 3.85376C9.952 3.65876 9.952 3.34176 10.147 3.14676L10.146 3.14576Z"/></svg>',
	'files': '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.5 22.5H17.595C17.07 23.4 16.11 24 15 24H7.5C4.185 24 1.5 21.315 1.5 18V6C1.5 4.89 2.1 3.93 3 3.405V18C3 20.475 5.025 22.5 7.5 22.5ZM21 8.121V18C21 19.6545 19.6545 21 18 21H7.5C5.8455 21 4.5 19.6545 4.5 18V3C4.5 1.3455 5.8455 0 7.5 0H12.879C13.4715 0 14.0505 0.24 14.4705 0.6585L20.3415 6.5295C20.766 6.954 21 7.5195 21 8.121ZM13.5 6.75C13.5 7.164 13.8375 7.5 14.25 7.5H19.1895L13.5 1.8105V6.75ZM19.5 18V9H14.25C13.0095 9 12 7.9905 12 6.75V1.5H7.5C6.672 1.5 6 2.1735 6 3V18C6 18.8265 6.672 19.5 7.5 19.5H18C18.828 19.5 19.5 18.8265 19.5 18Z"/></svg>',
	'flame': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8.1694 2.38161C8.44582 2.23863 8.72367 2.14217 8.96199 2.08199C8.98644 2.62292 9.15365 3.15614 9.38208 3.66553C9.7057 4.38719 10.1817 5.12315 10.6465 5.83569C10.6644 5.86313 10.6823 5.89054 10.7002 5.91792C11.1553 6.61534 11.5997 7.2963 11.9379 7.97958C12.2887 8.68856 12.5034 9.35877 12.5034 10C12.5034 11.1529 12.1584 12.1473 11.5114 12.8484C10.8704 13.5429 9.88689 14 8.50338 14C7.10629 14 6.13556 13.5958 5.45709 12.9749C4.77045 12.3465 4.33513 11.4518 4.09927 10.3914C3.87708 9.39256 4.07301 8.49755 4.33374 7.84072C4.37616 7.73386 4.42008 7.63386 4.46386 7.54138L4.58938 7.79243C4.97001 8.55369 5.89571 8.86226 6.65697 8.48162C7.50314 8.05854 7.73725 7.02244 7.37909 6.24601C7.00688 5.43912 6.71741 4.43545 6.97653 3.65811C7.17125 3.07394 7.63415 2.65846 8.1694 2.38161ZM4.11056 6.18914L4.10959 6.19037L4.10785 6.19258L4.1029 6.19894L4.08731 6.21936C4.07451 6.23635 4.057 6.26009 4.03559 6.29026C3.99281 6.35055 3.93432 6.43679 3.86679 6.54649C3.732 6.76546 3.55959 7.08054 3.40429 7.47178C3.0944 8.25245 2.84483 9.35744 3.12312 10.6086C3.38774 11.7982 3.89791 12.9035 4.78195 13.7126C5.67415 14.5292 6.89927 15 8.50338 15C10.1211 15 11.3875 14.4571 12.2463 13.5266C13.0989 12.6027 13.5034 11.3471 13.5034 10C13.5034 9.14123 13.2179 8.31144 12.8341 7.53604C12.4688 6.7979 11.9948 6.07168 11.5492 5.38919C11.5274 5.35579 11.5057 5.32249 11.484 5.2893C11.0111 4.56435 10.5805 3.89406 10.2945 3.25635C10.0087 2.61894 9.89683 2.07627 9.99247 1.59806C10.0219 1.45117 9.98382 1.29885 9.88885 1.18301C9.79389 1.06716 9.65198 1 9.50218 1C9.08022 1 8.377 1.14838 7.70997 1.49339C7.03689 1.84154 6.33312 2.42606 6.02784 3.34189C5.63773 4.51222 6.08683 5.83198 6.47104 6.66488C6.64207 7.03564 6.49357 7.44529 6.20976 7.5872C5.94247 7.72084 5.61745 7.6125 5.48381 7.34521L4.9494 6.27639C4.87302 6.12365 4.72397 6.02044 4.55412 6.0027C4.38427 5.98497 4.21685 6.05547 4.11056 6.18914Z"/></svg>',
	'globe': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1C4.141 1 1 4.141 1 8C1 11.859 4.141 15 8 15C11.859 15 15 11.859 15 8C15 4.141 11.859 1 8 1ZM8 14C7.422 14 6.686 12.906 6.288 11H9.713C9.315 12.906 8.579 14 8.001 14H8ZM6.121 10C6.044 9.392 6 8.723 6 8C6 7.277 6.044 6.608 6.121 6H9.878C9.955 6.608 9.999 7.277 9.999 8C9.999 8.723 9.955 9.392 9.878 10H6.121ZM2 8C2 7.299 2.121 6.626 2.343 6H5.121C5.041 6.656 5 7.332 5 8C5 8.668 5.041 9.344 5.121 10H2.343C2.121 9.374 2 8.701 2 8ZM8 2C8.578 2 9.314 3.094 9.712 5H6.287C6.685 3.094 7.422 2 8 2ZM10.879 6H13.657C13.879 6.626 14 7.299 14 8C14 8.701 13.879 9.374 13.657 10H10.879C10.959 9.344 11 8.668 11 8C11 7.332 10.959 6.656 10.879 6ZM13.195 5H10.722C10.516 3.938 10.199 2.98 9.775 2.268C11.228 2.719 12.446 3.707 13.195 5ZM6.226 2.268C5.802 2.98 5.484 3.938 5.279 5H2.806C3.556 3.707 4.774 2.718 6.226 2.268ZM2.805 11H5.278C5.484 12.062 5.801 13.02 6.225 13.732C4.772 13.281 3.554 12.293 2.805 11ZM9.774 13.732C10.198 13.02 10.516 12.062 10.721 11H13.194C12.444 12.293 11.226 13.282 9.774 13.732Z"/></svg>',
	'graph': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.25 15L13.75 15C14.439 15 15 14.439 15 13.75L15 2.25C15 1.561 14.439 1 13.75 1L12.25 1C11.561 1 11 1.561 11 2.25L11 13.75C11 14.439 11.561 15 12.25 15ZM12 2.25C12 2.112 12.112 2 12.25 2L13.75 2C13.888 2 14 2.112 14 2.25L14 13.75C14 13.888 13.888 14 13.75 14L12.25 14C12.112 14 12 13.888 12 13.75L12 2.25Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8.75 15L7.25 15C6.561 15 6 14.439 6 13.75L6 6.25C6 5.561 6.561 5 7.25 5L8.75 5C9.439 5 10 5.561 10 6.25L10 13.75C10 14.439 9.439 15 8.75 15ZM7.25 6C7.112 6 7 6.112 7 6.25L7 13.75C7 13.888 7.112 14 7.25 14L8.75 14C8.888 14 9 13.888 9 13.75L9 6.25C9 6.112 8.888 6 8.75 6L7.25 6Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M3.75 15L2.25 15C1.561 15 1 14.439 1 13.75L1 8.25C1 7.561 1.561 7 2.25 7L3.75 7C4.439 7 5 7.561 5 8.25L5 13.75C5 14.439 4.439 15 3.75 15ZM2.25 8C2.112 8 2 8.112 2 8.25L2 13.75C2 13.888 2.112 14 2.25 14L3.75 14C3.888 14 4 13.888 4 13.75L4 8.25C4 8.112 3.888 8 3.75 8L2.25 8Z"/></svg>',
	'graph-line': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1.5 15H14.5C14.776 15 15 14.776 15 14.5C15 14.224 14.776 14 14.5 14H2V9.70799L5.00001 6.70798L6.64601 8.35398C6.84101 8.54898 7.15801 8.54898 7.35301 8.35398L11.499 4.20798L13.145 5.85398C13.34 6.04898 13.657 6.04898 13.852 5.85398C14.047 5.65898 14.047 5.34198 13.852 5.14698L11.852 3.14698C11.657 2.95198 11.34 2.95198 11.145 3.14698L6.99901 7.29298L5.35301 5.64698C5.15801 5.45198 4.84101 5.45198 4.64601 5.64698L2 8.29299V1.5C2 1.224 1.776 1 1.5 1C1.224 1 1 1.224 1 1.5V9.4848C0.999674 9.49525 0.999674 9.50571 1 9.51617V14.5C1 14.776 1.224 15 1.5 15Z"/></svg>',
	'inspect': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1 4C1 2.89543 1.89543 2 3 2H13C14.1046 2 15 2.89543 15 4L15 10C15 10.8062 14.523 11.501 13.8358 11.8175C13.7656 11.6802 13.6736 11.5523 13.5607 11.4394L13.1148 10.9935C13.613 10.9366 14 10.5135 14 10L14 4C14 3.44772 13.5523 3 13 3H3C2.44772 3 2 3.44772 2 4L2 10C2 10.5523 2.44772 11 3 11H7V12H3C1.89543 12 1 11.1046 1 10L1 4ZM8.85356 8.14645C8.71056 8.00345 8.4955 7.96067 8.30866 8.03806C8.12182 8.11545 8 8.29777 8 8.5V14.5C8 14.7152 8.13772 14.9063 8.34189 14.9743C8.54606 15.0424 8.77087 14.9722 8.9 14.8L10.25 13H12.5C12.7022 13 12.8846 12.8782 12.9619 12.6913C13.0393 12.5045 12.9966 12.2894 12.8536 12.1464L8.85356 8.14645ZM9 13V9.70711L11.2929 12H10C9.84262 12 9.69443 12.0741 9.6 12.2L9 13Z"/></svg>',
	'layers': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 8.99993C7.819 8.99993 7.643 8.95093 7.486 8.85793L2.486 5.85693C2.186 5.67793 2 5.34893 2 4.99993C2 4.65093 2.187 4.32093 2.486 4.14193L7.486 1.14293C7.789 0.95693 8.207 0.95493 8.517 1.14493L13.513 4.14293C13.813 4.32293 13.999 4.65093 13.999 4.99993C13.999 5.34893 13.812 5.67893 13.513 5.85793L8.513 8.85693C8.357 8.95093 8.181 8.99993 8 8.99993ZM8 1.99993L3 4.99993L8 7.99993L13 4.99993L8 1.99993Z"/><path d="M2.146 6.9873L8 10.5003L13.854 6.9873C13.946 7.1413 14 7.3173 14 7.5003C14 7.8493 13.814 8.1783 13.514 8.3583L8.514 11.3573C8.357 11.4513 8.181 11.5003 8 11.5003C7.819 11.5003 7.642 11.4513 7.486 11.3583L2.486 8.35731C2.187 8.17931 2 7.8503 2 7.5003C2 7.3163 2.054 7.1403 2.146 6.9873Z"/><path d="M2.146 9.4873L8 13.0003L13.854 9.4873C13.946 9.6413 14 9.8173 14 10.0003C14 10.3493 13.814 10.6783 13.514 10.8583L8.514 13.8573C8.357 13.9513 8.181 14.0003 8 14.0003C7.819 14.0003 7.642 13.9513 7.486 13.8583L2.486 10.8573C2.187 10.6793 2 10.3503 2 10.0003C2 9.8163 2.054 9.6403 2.146 9.4873Z"/></svg>',
	'library': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1 3.24941C1 2.55938 1.55917 2 2.24895 2H2.74852C3.4383 2 3.99747 2.55938 3.99747 3.24941V12.745C3.99747 13.435 3.4383 13.9944 2.74852 13.9944H2.24895C1.55917 13.9944 1 13.435 1 12.745V3.24941ZM2.24895 2.99953C2.11099 2.99953 1.99916 3.11141 1.99916 3.24941V12.745C1.99916 12.883 2.11099 12.9948 2.24895 12.9948H2.74852C2.88648 12.9948 2.99831 12.883 2.99831 12.745V3.24941C2.99831 3.11141 2.88648 2.99953 2.74852 2.99953H2.24895ZM4.99663 3.24941C4.99663 2.55938 5.5558 2 6.24557 2H6.74515C7.43492 2 7.9941 2.55938 7.9941 3.24941V12.745C7.9941 13.435 7.43492 13.9944 6.74515 13.9944H6.24557C5.5558 13.9944 4.99663 13.435 4.99663 12.745V3.24941ZM6.24557 2.99953C6.10762 2.99953 5.99578 3.11141 5.99578 3.24941V12.745C5.99578 12.883 6.10762 12.9948 6.24557 12.9948H6.74515C6.88311 12.9948 6.99494 12.883 6.99494 12.745V3.24941C6.99494 3.11141 6.88311 2.99953 6.74515 2.99953H6.24557ZM11.9723 4.77682C11.7231 4.15733 11.0311 3.84331 10.4011 4.06385L9.81888 4.26764C9.14658 4.50297 8.80684 5.25222 9.07268 5.91326L12.0098 13.2166C12.2589 13.8361 12.9509 14.1502 13.581 13.9296L14.1632 13.7258C14.8355 13.4904 15.1752 12.7412 14.9093 12.0802L11.9723 4.77682ZM10.7311 5.00729C10.8571 4.96318 10.9955 5.02598 11.0453 5.14988L13.9824 12.4532C14.0356 12.5854 13.9676 12.7353 13.8332 12.7823L13.251 12.9862C13.1249 13.0303 12.9865 12.9675 12.9367 12.8436L9.99964 5.5402C9.94647 5.40799 10.0144 5.25815 10.1489 5.21108L10.7311 5.00729Z"/></svg>',
	'lightbulb-sparkle': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8.19905 2.782L8.96605 3.031L9.04905 3.061C9.04905 3.061 9.05405 3.063 9.05605 3.064C9.11905 3.089 9.18105 3.119 9.24005 3.152C9.36605 3.223 9.48105 3.311 9.58405 3.413C9.73805 3.566 9.85805 3.75 9.93605 3.952C9.94605 3.979 9.95605 4.006 9.96505 4.033L10.214 4.798C10.235 4.857 10.273 4.908 10.325 4.944C10.376 4.98 10.437 5 10.5 5H10.504C10.565 5 10.625 4.98 10.675 4.944C10.709 4.92 10.737 4.889 10.759 4.854C10.77 4.836 10.779 4.817 10.786 4.798L11.035 4.033C11.112 3.8 11.243 3.589 11.416 3.416C11.589 3.243 11.801 3.112 12.034 3.035L12.799 2.786C12.858 2.765 12.909 2.727 12.945 2.676C12.981 2.625 13.001 2.564 13.001 2.501C13.001 2.438 12.982 2.378 12.945 2.326C12.909 2.275 12.858 2.237 12.799 2.217L12.784 2.213L12.019 1.964C11.86 1.911 11.711 1.834 11.577 1.735C11.515 1.689 11.456 1.638 11.401 1.583C11.228 1.41 11.097 1.198 11.02 0.966L10.771 0.201C10.75 0.142 10.712 0.091 10.66 0.055C10.613 0.022 10.558 0.003 10.501 0H10.486C10.423 0 10.362 0.019 10.311 0.055C10.26 0.091 10.221 0.142 10.201 0.201L9.95205 0.966C9.87605 1.197 9.74805 1.407 9.57705 1.58C9.55205 1.605 9.52705 1.629 9.50105 1.652C9.34605 1.79 9.16505 1.896 8.96805 1.964L8.37305 2.157H8.37105L8.19905 2.212C8.14005 2.233 8.08905 2.272 8.05305 2.323C8.01705 2.374 7.99705 2.435 7.99705 2.498C7.99705 2.561 8.01705 2.622 8.05305 2.672C8.08905 2.723 8.14005 2.761 8.19905 2.782ZM11.62 7.538C11.609 7.503 11.588 7.468 11.558 7.439C11.528 7.41 11.493 7.388 11.455 7.375L11.341 7.337C11.279 7.544 11.199 7.746 11.102 7.941C10.86 8.425 10.518 8.851 10.098 9.192L9.99005 9.292L9.54105 11H6.49205L6.14305 9.536L6.04305 9.436C5.18305 8.706 4.63105 7.677 4.49805 6.556C4.51205 5.607 4.88505 4.699 5.54105 4.013C5.86205 3.688 6.24505 3.432 6.66705 3.258C6.82305 3.194 6.98305 3.141 7.14505 3.101C7.05005 2.921 6.99805 2.713 6.99805 2.497C6.99805 2.358 7.02005 2.223 7.06205 2.094C6.79605 2.15 6.53505 2.23 6.28205 2.335C5.73805 2.56 5.24505 2.892 4.83105 3.31C3.99305 4.18 3.51605 5.336 3.49805 6.544V6.582C3.62305 7.911 4.24305 9.144 5.23505 10.037L5.93505 12.978L5.94305 13C6.04105 13.289 6.22805 13.54 6.47705 13.717C6.73405 13.901 7.04305 14 7.36005 14H8.76405C9.07305 13.974 9.36605 13.854 9.60405 13.655C9.84305 13.456 10.012 13.185 10.085 12.882L10.885 9.832C11.33 9.443 11.697 8.975 11.968 8.452C11.91 8.365 11.862 8.27 11.827 8.169L11.62 7.538ZM9.11605 12.628V12.641C9.09405 12.735 9.04105 12.82 8.96605 12.881C8.89105 12.947 8.79705 12.988 8.69805 13H7.35905C7.25105 12.999 7.14605 12.964 7.05905 12.9C6.98705 12.85 6.93105 12.781 6.89805 12.7L6.73105 12H9.28005L9.11605 12.628ZM14.956 5.862C14.927 5.822 14.886 5.791 14.839 5.774L14.827 5.771L14.215 5.572V5.574C14.029 5.512 13.86 5.408 13.721 5.269C13.582 5.13 13.478 4.961 13.416 4.775L13.217 4.163C13.201 4.116 13.17 4.075 13.129 4.046C13.088 4.018 13.039 4.002 12.989 4.002C12.939 4.002 12.89 4.017 12.849 4.046C12.809 4.075 12.778 4.116 12.761 4.163L12.562 4.775C12.501 4.959 12.399 5.127 12.262 5.266C12.126 5.404 11.959 5.51 11.775 5.573L11.163 5.772C11.116 5.788 11.074 5.819 11.046 5.86C11.018 5.901 11.002 5.95 11.002 6C11.002 6.05 11.017 6.099 11.046 6.14C11.075 6.18 11.116 6.211 11.163 6.228L11.746 6.417V6.42L11.77 6.428C11.957 6.49 12.126 6.594 12.265 6.733C12.403 6.872 12.508 7.042 12.57 7.228L12.77 7.84C12.786 7.887 12.817 7.928 12.858 7.957C12.898 7.985 12.945 8.001 12.994 8.001H13.001C13.051 8.001 13.1 7.986 13.141 7.957C13.182 7.928 13.212 7.887 13.229 7.84L13.428 7.228C13.49 7.042 13.594 6.873 13.733 6.734C13.872 6.595 14.041 6.491 14.227 6.429L14.839 6.23C14.886 6.214 14.928 6.183 14.956 6.142C14.984 6.101 15 6.052 15 6.002C15 5.952 14.985 5.903 14.956 5.862Z"/></svg>',
	'link-external': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M15 9.5V12.5C15 13.879 13.879 15 12.5 15H3.5C2.121 15 1 13.879 1 12.5V3.5C1 2.121 2.121 1 3.5 1H6.5C6.776 1 7 1.224 7 1.5C7 1.776 6.776 2 6.5 2H3.5C2.673 2 2 2.673 2 3.5V12.5C2 13.327 2.673 14 3.5 14H12.5C13.327 14 14 13.327 14 12.5V9.5C14 9.224 14.224 9 14.5 9C14.776 9 15 9.224 15 9.5ZM14.5 1H9.5C9.224 1 9 1.224 9 1.5C9 1.776 9.224 2 9.5 2H13.293L9.147 6.146C8.952 6.341 8.952 6.658 9.147 6.853C9.245 6.951 9.373 6.999 9.501 6.999C9.629 6.999 9.757 6.95 9.855 6.853L14.001 2.707V6.5C14.001 6.776 14.225 7 14.501 7C14.777 7 15.001 6.776 15.001 6.5V1.5C15.001 1.224 14.777 1 14.501 1H14.5Z"/></svg>',
	'list-flat': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2 3.5C2 3.224 2.224 3 2.5 3H10.5C10.776 3 11 3.224 11 3.5C11 3.776 10.776 4 10.5 4H2.5C2.224 4 2 3.776 2 3.5ZM13.5 6H2.5C2.224 6 2 6.224 2 6.5C2 6.776 2.224 7 2.5 7H13.5C13.776 7 14 6.776 14 6.5C14 6.224 13.776 6 13.5 6ZM9.5 9H2.5C2.224 9 2 9.224 2 9.5C2 9.776 2.224 10 2.5 10H9.5C9.776 10 10 9.776 10 9.5C10 9.224 9.776 9 9.5 9Z"/><path d="M2.5 12H11.5C11.776 12 12 12.224 12 12.5C12 12.776 11.776 13 11.5 13H2.5C2.224 13 2 12.776 2 12.5C2 12.224 2.224 12 2.5 12Z"/></svg>',
	'list-tree': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2 3.5C2 3.22386 2.22386 3 2.5 3H13.5C13.7761 3 14 3.22386 14 3.5C14 3.77614 13.7761 4 13.5 4H6V6H13.5C13.7761 6 14 6.22386 14 6.5C14 6.77614 13.7761 7 13.5 7H6V9H13.5C13.7761 9 14 9.22386 14 9.5C14 9.77614 13.7761 10 13.5 10H6V12H13.5C13.7761 12 14 12.2239 14 12.5C14 12.7761 13.7761 13 13.5 13H5.5C5.22386 13 5 12.7761 5 12.5V4H2.5C2.22386 4 2 3.77614 2 3.5Z"/></svg>',
	'organization': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M6.00195 4.00002C6.00195 2.89655 6.89649 2.00201 7.99995 2.00201C9.10342 2.00201 9.99796 2.89655 9.99796 4.00002C9.99796 5.10348 9.10342 5.99802 7.99995 5.99802C6.89649 5.99802 6.00195 5.10348 6.00195 4.00002ZM7.99995 3.00201C7.44877 3.00201 7.00195 3.44883 7.00195 4.00002C7.00195 4.5512 7.44877 4.99802 7.99995 4.99802C8.55114 4.99802 8.99796 4.5512 8.99796 4.00002C8.99796 3.44883 8.55114 3.00201 7.99995 3.00201ZM11 4.5C11 3.67157 11.6716 3 12.5 3C13.3284 3 14 3.67157 14 4.5C14 5.32843 13.3284 6 12.5 6C11.6716 6 11 5.32843 11 4.5ZM12.5 4C12.2239 4 12 4.22386 12 4.5C12 4.77614 12.2239 5 12.5 5C12.7761 5 13 4.77614 13 4.5C13 4.22386 12.7761 4 12.5 4ZM3.5 3C2.67157 3 2 3.67157 2 4.5C2 5.32843 2.67157 6 3.5 6C4.32843 6 5 5.32843 5 4.5C5 3.67157 4.32843 3 3.5 3ZM3 4.5C3 4.22386 3.22386 4 3.5 4C3.77614 4 4 4.22386 4 4.5C4 4.77614 3.77614 5 3.5 5C3.22386 5 3 4.77614 3 4.5ZM4.26756 6.99969C4.09739 7.29387 4 7.63541 4 7.99969L2 7.99969V10.5C2 11.3285 2.67157 12 3.5 12C3.71194 12 3.91361 11.9561 4.09639 11.8768C4.1705 12.2082 4.28572 12.524 4.43643 12.8187C4.14721 12.9356 3.83112 13 3.5 13C2.11929 13 1 11.8807 1 10.5V7.99969C1 7.44741 1.44772 6.99969 2 6.99969H4.26756ZM11.5636 12.8187C11.8528 12.9356 12.1689 13 12.5 13C13.8807 13 15 11.8807 15 10.5V7.99969C15 7.44741 14.5523 6.99969 14 6.99969H11.7324C11.9026 7.29387 12 7.63541 12 7.9997L14 7.99969V10.5C14 11.3285 13.3284 12 12.5 12C12.2881 12 12.0864 11.9561 11.9036 11.8768C11.8295 12.2082 11.7143 12.524 11.5636 12.8187ZM6 6.99969C5.44772 6.99969 5 7.44741 5 7.99969V11C5 12.6569 6.34315 14 8 14C9.65685 14 11 12.6569 11 11V7.99969C11 7.44741 10.5523 6.99969 10 6.99969H6ZM6 7.99969L10 7.99969V11C10 12.1046 9.10457 13 8 13C6.89543 13 6 12.1046 6 11V7.99969Z"/></svg>',
	'paintcan': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.49998 1C7.77613 1 7.99998 1.22386 7.99998 1.5V2.42763C8.15702 2.4998 8.30415 2.60053 8.43355 2.72983L12.1458 6.43921C12.7319 7.02493 12.7321 7.97499 12.1462 8.56093L7.0781 13.629C6.48218 14.2249 5.51243 14.2131 4.93123 13.6028L1.31095 9.80152C0.749447 9.21194 0.760786 8.28209 1.3365 7.70638L6.31263 2.73023C6.50977 2.53309 6.74814 2.4023 6.99998 2.33785V1.5C6.99998 1.22386 7.22384 1 7.49998 1ZM6.99998 4.5V3.4571L2.45709 8H11.2929L11.4391 7.85383C11.6344 7.65851 11.6343 7.34182 11.4389 7.14658L7.99998 3.71027V4.5C7.99998 4.77614 7.77613 5 7.49998 5C7.22384 5 6.99998 4.77614 6.99998 4.5ZM1.95461 9C1.97565 9.03992 2.00247 9.07761 2.03509 9.11187L5.65537 12.9132C5.8491 13.1166 6.17235 13.1205 6.37099 12.9219L10.2929 9H1.95461ZM12.9211 10.222C12.6981 9.96719 12.3018 9.96719 12.0789 10.222L10.9285 11.5367C9.74705 12.8869 10.7059 15 12.5 15C14.2941 15 15.2529 12.8869 14.0715 11.5367L12.9211 10.222ZM11.681 12.1952L12.5 11.2593L13.3189 12.1952C13.9346 12.8989 13.4349 14 12.5 14C11.5651 14 11.0654 12.8989 11.681 12.1952Z"/></svg>',
	'percentage': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M4.5 7C3.121 7 2 5.879 2 4.5C2 3.121 3.121 2 4.5 2C5.879 2 7 3.121 7 4.5C7 5.879 5.879 7 4.5 7ZM4.5 3C3.673 3 3 3.673 3 4.5C3 5.327 3.673 6 4.5 6C5.327 6 6 5.327 6 4.5C6 3.673 5.327 3 4.5 3ZM11.5 14C10.121 14 9 12.879 9 11.5C9 10.121 10.121 9 11.5 9C12.879 9 14 10.121 14 11.5C14 12.879 12.879 14 11.5 14ZM11.5 10C10.673 10 10 10.673 10 11.5C10 12.327 10.673 13 11.5 13C12.327 13 13 12.327 13 11.5C13 10.673 12.327 10 11.5 10ZM3.854 12.854L12.854 3.854C13.049 3.659 13.049 3.342 12.854 3.147C12.659 2.952 12.342 2.952 12.147 3.147L3.146 12.146C2.951 12.341 2.951 12.658 3.146 12.853C3.244 12.951 3.372 12.999 3.5 12.999C3.628 12.999 3.756 12.95 3.854 12.853V12.854Z"/></svg>',
	'pulse': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M5.76002 2.49999C5.98102 2.50399 6.17302 2.65399 6.23202 2.86699L8.52102 11.19L10.271 5.35599C10.332 5.15399 10.513 5.01099 10.724 4.99999C10.935 4.98899 11.13 5.11199 11.211 5.30699L12.333 7.99899H14C14.276 7.99899 14.5 8.22299 14.5 8.49899C14.5 8.77499 14.276 8.99899 14 8.99899H12C11.798 8.99899 11.616 8.87799 11.538 8.69099L10.826 6.98299L8.97802 13.142C8.91402 13.356 8.71602 13.501 8.49302 13.498C8.27002 13.495 8.07602 13.346 8.01702 13.131L5.71402 4.75699L4.47502 8.64999C4.40902 8.85799 4.21602 8.99799 3.99902 8.99799H1.99902C1.72302 8.99799 1.49902 8.77399 1.49902 8.49799C1.49902 8.22199 1.72302 7.99799 1.99902 7.99799H3.63302L5.27202 2.84599C5.33902 2.63499 5.53702 2.49299 5.75802 2.49799L5.76002 2.49999Z"/></svg>',
	'search': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M10.0195 10.7266C9.06578 11.5217 7.83875 12 6.5 12C3.46243 12 1 9.53757 1 6.5C1 3.46243 3.46243 1 6.5 1C9.53757 1 12 3.46243 12 6.5C12 7.83875 11.5217 9.06578 10.7266 10.0195L13.8535 13.1464C14.0488 13.3417 14.0488 13.6583 13.8535 13.8536C13.6583 14.0488 13.3417 14.0488 13.1464 13.8536L10.0195 10.7266ZM11 6.5C11 4.01472 8.98528 2 6.5 2C4.01472 2 2 4.01472 2 6.5C2 8.98528 4.01472 11 6.5 11C8.98528 11 11 8.98528 11 6.5Z"/></svg>',
	'table': '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1 3.5C1 2.11929 2.11929 1 3.5 1H12.5C13.8807 1 15 2.11929 15 3.5V12.5C15 13.8807 13.8807 15 12.5 15H3.5C2.11929 15 1 13.8807 1 12.5V3.5ZM6 14H10V11L6 11V14ZM5 11H2V12.5C2 13.3284 2.67157 14 3.5 14H5V11ZM6 10L10 10V6L6 6V10ZM5 6H2V10H5V6ZM6 5L10 5V2H6V5ZM5 2H3.5C2.67157 2 2 2.67157 2 3.5V5H5V2ZM14 6H11V10H14V6ZM14 11H11V14H12.5C13.3284 14 14 13.3284 14 12.5V11ZM14 5V3.5C14 2.67157 13.3284 2 12.5 2H11V5H14Z"/></svg>',
};

/**
 * The codicon of each Next Steps group, keyed by group id. Group ids that mean the same thing
 * across panels (e.g. `rates` in the FRED and ECB panels) share an icon; unknown ids get none.
 */
const NEXT_STEP_GROUP_CODICONS: Readonly<Record<string, string>> = {
	visualise: 'graph-line',
	diagnose: 'beaker',
	predict: 'link-external',
	compare: 'diff',
	interpret: 'lightbulb-sparkle',
	export: 'export',
	prices: 'graph-line',
	returns: 'pulse',
	fundamentals: 'briefcase',
	options: 'list-tree',
	search: 'search',
	equities: 'graph-line',
	fxcrypto: 'arrow-swap',
	indicators: 'pulse',
	economic: 'globe',
	exchange: 'arrow-swap',
	rates: 'percentage',
	inflation: 'flame',
	money: 'credit-card',
	yields: 'graph-line',
	growth: 'graph',
	labor: 'organization',
	submissions: 'list-flat',
	facts: 'table',
	concept: 'graph-line',
	frames: 'layers',
	browse: 'library',
	load: 'database',
	download: 'cloud-download',
	files: 'files',
	read: 'table',
	write: 'edit',
	format: 'paintcan',
	inspect: 'inspect',
};

/** The icon SVG of a Next Steps group, or '' when its id has none. */
export function nextStepIcon(groupId: string): string {
	const codicon = NEXT_STEP_GROUP_CODICONS[groupId];
	return codicon ? NEXT_STEP_CODICONS[codicon] : '';
}

export interface WebviewParts {
	readonly title: string;
	readonly bullets: string;
	readonly decisionRows: string;
	/** Optional HTML rendered above / below the Key Points pane (from `[notes.keyPoints]`). */
	readonly keyPointsIntro?: string;
	readonly keyPointsFootnote?: string;
	/** Optional HTML rendered above / below the Decision Table pane (from `[notes.decision]`). */
	readonly decisionIntro?: string;
	readonly decisionFootnote?: string;
	/** Optional HTML rendered above / below the Illustration pane (from `[notes.explore]`). */
	readonly illustrationIntro?: string;
	readonly illustrationFootnote?: string;
	readonly defaultModel: string;
	readonly modelsLiteral: string;
	readonly chartW: number;
	readonly miniChartsJs: string;
	readonly codeBranchesJs: string;
	readonly actionsJs: string;
	/** The model-toggle (tab) buttons, e.g. `<button class="toggle-btn active" data-model="...">…</button>`. */
	readonly togglesJs: string;
	/**
	 * Parameter inputs shown between the model toggles and the Example Code box (see `buildInputsHtml`
	 * in scaffoldParts.ts). Code lines built with `codeLine()` read them through `{{id}}` placeholders.
	 */
	readonly inputsHtml?: string;
	/** Optional CSS rule for this webview's (legacy) hidden param rows. Default: none. */
	readonly hiddenRowCss?: string;
	/** Start the illustration pane collapsed (e.g. webviews with no gallery yet). Default: open. */
	readonly illusCollapsed?: boolean;
	/** Leave the illustration pane out entirely (a panel with neither a gallery nor an override). Default: shown. */
	readonly omitIllustration?: boolean;
	/**
	 * JS injected at the top of `renderIllustration` (after `var body = ...`). If it renders custom
	 * content into `body` and `return`s, the shared mini-chart gallery is skipped — this is the hook
	 * for non-gallery illustrations (a "Coming Soon" stub, model equations, a field panorama, …).
	 * Default: empty (the gallery renders).
	 */
	readonly illustrationOverrideJs?: string;
	/** Extra CSS appended to the style block (e.g. sfviz's interactive-checkbox styling). */
	readonly extraCss?: string;
	/** If set, the bottom button bar becomes a split bar with this label on the left (sfviz's Interactive toggle). */
	readonly interactiveLabelHtml?: string;
	/** JS injected near the top of the script, after the var declarations (e.g. `var interactive = true;`). */
	readonly headScriptJs?: string;
	/** JS injected into setModel after `currentModel = model;` (e.g. sfviz hiding the Interactive toggle for 2D). */
	readonly setModelExtraJs?: string;
	/** JS appended at the very end of the script, after the initial setModel (e.g. sfviz's checkbox listener). */
	readonly tailScriptJs?: string;
	/** Override the "Illustration" label on the collapsible pane toggle. Default: "Illustration". */
	readonly illustrationLabel?: string;
	/** Override the first column header of the decision table. Default: "Plot". */
	readonly decisionFirstColumn?: string;
	/**
	 * Custom Next Steps button list items. Each item must be a `<li>` containing a
	 * `<button class="list-btn panel-toggle" id="btn-XXX">` element. When supplied,
	 * this replaces the default five buttons (Visualise / Diagnose / Predict / Compare /
	 * Interpret). Must be paired with `nextStepsWiringJs`.
	 */
	readonly nextStepsHtml?: string;
	/**
	 * JS that wires up the custom Next Steps buttons declared in `nextStepsHtml`.
	 * Called in place of the five default `addEventListener` calls. Each button should
	 * call `showRightPanel(MY_ACTIONS, 'Label', 'btn-XXX')` on click.
	 */
	readonly nextStepsWiringJs?: string;
	/** Extra JS appended at the end of the main script block (e.g. message handlers for custom panels). */
	readonly extraJs?: string;
}

/**
 * Build the full HTML for a Visualise webview from its webview-specific parts.
 * The shared scaffold (CSS, layout, tabs, theme-colourised code boxes, Next Steps /
 * Learn More panels, illustration gallery, message handling) lives here; each webview
 * supplies only its title, bullets, decision table, models, mini-charts, code branches
 * and action arrays.
 */
export function buildWebviewHtml(parts: WebviewParts): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' https://*.vscode-resource.vscode-cdn.net; img-src data: https://*.vscode-resource.vscode-cdn.net; font-src data:;">
	<title>${parts.title}</title>
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; padding: 0; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); overflow-x: hidden; }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
		.voice-group { display: inline-flex; align-items: center; gap: 8px; }
		.voice-stub { background: transparent; border: none; color: var(--vscode-textLink-foreground); cursor: pointer; padding: 3px; display: inline-flex; border-radius: 50%; transition: background 0.15s, color 0.15s; }
		.voice-stub:hover { color: var(--vscode-textLink-activeForeground); }
		.voice-stub.active { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
		.voice-stub.active:hover { color: var(--vscode-editor-background); }
		.section { margin: 0 0 20px 0; }
		.section-toggle { display: flex; align-items: center; gap: 6px; width: 100%; text-align: left; background: transparent; border: none; color: var(--vscode-foreground); font-size: 15px; font-weight: 500; font-family: var(--vscode-font-family); cursor: pointer; padding: 4px 0; user-select: none; }
		.section-toggle:hover { text-decoration: underline; }
		.section-toggle .illus-chevron { display: inline-flex; transition: transform 0.15s; flex-shrink: 0; }
		.section.collapsed .section-toggle .illus-chevron { transform: rotate(-90deg); }
		.section.collapsed .section-body { display: none; }
		.section-body { padding: 6px 0 0 0; }
		/* Key Points (.methods-list), Next Steps / Learn More (.column-list) and the Explore intro
		   (.illus-note) self-indent by 22px to align under the pane title. The Decision Table and
		   Example Code panes have no self-indenting child, so indent their bodies here to match. */
		#sec-table .section-body, #sec-code .section-body { padding-left: 22px; }
		.powered-by { margin: 4px 0 16px 0; line-height: 1.4; display: flex; align-items: baseline; flex-wrap: wrap; }
		.package-link { color: var(--vscode-textLink-foreground); text-decoration: none; cursor: pointer; }
		.package-link:hover { text-decoration: underline; }
		.package-status { margin-left: 7px; }
		.pkg-check { color: var(--vscode-charts-green); font-weight: 700; }
		.pkg-install { color: var(--vscode-textLink-foreground); cursor: pointer; font-size: 12px; }
		.pkg-install:hover { text-decoration: underline; }
		.pkg-install svg { width: 13px; height: 13px; vertical-align: -2px; margin-right: 2px; }
		.pkg-installing { color: var(--vscode-descriptionForeground); font-style: italic; font-size: 12px; }
		.api-key-status { margin-left: auto; padding-left: 12px; font-size: 12px; }
		.apikey-ok { color: var(--vscode-charts-green); }
		.apikey-link { color: var(--vscode-textLink-foreground); cursor: pointer; }
		.apikey-link:hover { text-decoration: underline; }
		.apikey-sep { color: var(--vscode-descriptionForeground); opacity: 0.5; margin: 0 6px; }
		.apikey-icon { width: 12px; height: 12px; vertical-align: -2px; margin-right: 3px; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; }
		.methods-list { list-style: none; padding-left: 22px; margin: 5px 0; }
		.methods-list li { margin: 2px 0; padding-left: 20px; position: relative; }
		.methods-list li::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); }
		.plot-link { color: var(--vscode-textLink-foreground); cursor: pointer; }
		.plot-link:hover { text-decoration: underline; }
		.decision-table { border-collapse: collapse; width: 100%; font-size: 12px; margin-top: 10px; }
		.decision-table th { text-align: left; padding: 6px 10px; border-bottom: 2px solid var(--vscode-widget-border); color: var(--vscode-foreground); font-weight: 600; white-space: nowrap; }
		.decision-table td { padding: 5px 10px; border-bottom: 1px solid var(--vscode-widget-border); color: var(--vscode-foreground); vertical-align: top; line-height: 1.4; }
		.decision-table tr:last-child td { border-bottom: none; }
		.decision-table td:first-child { color: var(--vscode-textLink-foreground); font-weight: 500; white-space: nowrap; }
		.decision-table td:nth-child(2) { min-width: 140px; }
		.pane-intro { margin: 0 0 12px; font-size: 12px; line-height: 1.5; color: var(--vscode-descriptionForeground); border-left: 2px solid var(--vscode-textLink-foreground); padding-left: 10px; }
		.pane-note { margin: 10px 0 0; font-size: 12px; line-height: 1.5; color: var(--vscode-descriptionForeground); border-left: 2px solid var(--vscode-textLink-foreground); padding-left: 10px; }
		.pane-intro em, .pane-note em { font-style: italic; color: var(--vscode-foreground); }
		.pane-intro strong, .pane-note strong { color: var(--vscode-foreground); }
		.pane-intro code, .pane-note code { font-family: var(--vscode-editor-font-family, monospace); font-size: 11px; background: var(--vscode-textCodeBlock-background); color: var(--vscode-foreground); padding: 1px 5px; border-radius: 3px; }
		.model-toggle { display: flex; flex-wrap: wrap; gap: 0; margin: 0; border: none; background: var(--vscode-editorGroupHeader-tabsBackground, transparent); overflow: visible; }
		.toggle-btn { background: var(--vscode-tab-inactiveBackground); border: none; border-right: 1px solid var(--vscode-tab-border); border-top: 1px solid transparent; color: var(--vscode-tab-inactiveForeground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 16px; height: 35px; line-height: 33px; transition: background 0.1s; white-space: nowrap; margin-bottom: -1px; position: relative; }
		.toggle-btn.active { background: var(--vscode-textCodeBlock-background); color: var(--vscode-tab-activeForeground); border-top: 1px solid var(--vscode-tab-activeBorderTop, transparent); z-index: 1; }
		.toggle-btn:not(.active):hover { background: var(--vscode-tab-hoverBackground, var(--vscode-list-hoverBackground)); color: var(--vscode-tab-hoverForeground, var(--vscode-tab-activeForeground)); }
		.illus-section { margin: 0 0 20px 0; }
		.illus-toggle { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-foreground); font-size: 15px; font-weight: 500; font-family: var(--vscode-font-family); cursor: pointer; padding: 4px 0; user-select: none; }
		.illus-toggle:hover { text-decoration: underline; }
		.illus-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
		.illus-section.collapsed .illus-chevron { transform: rotate(-90deg); }
		.illus-section.collapsed .illus-body { display: none; }
		.illus-section.collapsed .illus-note { display: none; }
		.illus-note { margin-left: 22px; }
		.illus-body { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 16px 20px; overflow-x: auto; }
		.form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
		.form-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; }
		.form-row .form-group { flex: 1; min-width: 120px; margin-bottom: 0; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-label-with-tooltip { position: relative; display: inline-flex; align-items: center; gap: 5px; }
		.tooltip-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: help; flex-shrink: 0; }
		.tooltip-icon.pinned { background-color: var(--vscode-charts-green); }
		.tooltip-text { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 300px; z-index: 1000; display: none; margin-bottom: 5px; }
		.tooltip-icon:hover + .tooltip-text, .tooltip-text:hover, .tooltip-text.pinned { display: block; }
		/* Floating variant: a single shared tooltip positioned 'fixed' by JS for .tooltip-icon[data-tip]
		   (works for dynamically-created icons and inside scrolling/overflow containers). */
		.tooltip-floating { position: fixed; bottom: auto; left: auto; transform: none; margin: 0; z-index: 10000; pointer-events: none; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		textarea.form-input { resize: none; overflow-x: auto; overflow-y: hidden; white-space: nowrap; height: 37px; line-height: 1.4; }
		textarea.form-input::-webkit-scrollbar { display: none; }
		textarea.form-input.multiline { height: auto; white-space: pre; overflow-y: auto; resize: vertical; }
		select.form-input { height: 37px; cursor: pointer; }
		.param-input { text-align: center; }
		.code-preview-wrapper { position: relative; margin: 0 0 20px 0; }
		#code-preview { border-top-left-radius: 0; border-top-right-radius: 0; }
		.code-preview { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 20px; padding-right: 50px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.6; overflow-x: auto; }
		.code-line { color: var(--vscode-foreground); margin: 4px 0; white-space: pre; }
		.code-blank { margin: 8px 0; }
		.code-comment { color: #6A9955; font-style: italic; }
		.hl-keyword { color: var(--vscode-symbolIcon-keywordForeground); }
		.hl-fn      { color: var(--vscode-textPreformat-foreground); }
		.hl-type    { color: var(--vscode-symbolIcon-classForeground); }
		.copy-btn { position: absolute; top: 8px; right: 8px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; opacity: 0.7; }
		.copy-btn:hover { opacity: 1; }
		.code-btn-bar { display: flex; justify-content: flex-end; gap: 4px; margin-bottom: 6px; }
		.code-btn-bar-bottom { margin-bottom: 0; margin-top: 6px; }
		.code-action-btn { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; opacity: 0.7; white-space: nowrap; }
		.code-action-btn:hover { opacity: 1; }
		.code-btn-bar-split { justify-content: space-between; }
		.code-btn-group { display: flex; align-items: center; gap: 4px; }
		.code-action-btn:disabled { opacity: 0.35; cursor: default; }
		.code-action-btn.primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); opacity: 1; }
		.code-action-btn.primary:hover { background: var(--vscode-button-hoverBackground); }
		/* Editable Example Code (main box and Next Steps panel): the box swaps for a textarea while editing; a saved example is marked Customised. */
		.code-edit-wrap { position: relative; display: none; }
		#sec-code.editing .code-edit-wrap, #right-panel.editing .code-edit-wrap { display: block; }
		#sec-code.editing #code-preview, #right-panel.editing #panel-code { display: none; }
		#sec-code.editing .model-toggle, #sec-code.editing .scaffold-inputs { pointer-events: none; opacity: 0.5; }
		.scaffold-inputs .form-row[hidden], .scaffold-input[hidden] { display: none; }
		.code-edit { display: block; width: 100%; min-height: 120px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); border-radius: 0 0 6px 6px; padding: 20px; padding-right: 80px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.6; white-space: pre; overflow: auto; resize: vertical; tab-size: 4; }
		.code-edit-label { position: absolute; top: 8px; right: 12px; font-size: 11px; color: var(--vscode-textLink-foreground); pointer-events: none; }
		.code-custom-tag { display: none; margin-left: 4px; font-size: 11px; font-weight: 500; line-height: 16px; color: var(--vscode-editorWarning-foreground); border: 1px solid var(--vscode-editorWarning-foreground); border-radius: 10px; padding: 0 8px; }
		#sec-code.customised .code-custom-tag, #right-panel.customised .code-custom-tag { display: inline-block; }
		.panel-code-title .code-custom-tag { margin-left: 8px; }
		.bottom-layout.panel-editing .left-strip > .section { pointer-events: none; opacity: 0.5; }
		.panel-back:disabled, .panel-close:disabled { opacity: 0.4; cursor: default; }
		/* Local Wikis / Notebook Tutorials cards: Edit / Restore Default links appear on hover; a customised one gets the amber dot. */
		.copy-item { position: relative; display: flex; }
		.copy-item .nb-card { padding-bottom: 26px; }
		.copy-actions { position: absolute; right: 10px; bottom: 7px; display: flex; gap: 12px; opacity: 0; }
		.copy-item:hover .copy-actions, .copy-item:focus-within .copy-actions { opacity: 1; }
		.copy-link { background: none; border: none; padding: 0; font-size: 11px; font-family: var(--vscode-font-family); color: var(--vscode-textLink-foreground); cursor: pointer; }
		.copy-link:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.copy-item:not(.has-custom) .copy-link[data-copy-act="restore"] { display: none; }
		/* Explore References: list (60%) + details / Add Reference form (40%). */
		.refs-container { display: flex; gap: 16px; height: 400px; }
		.refs-list-panel { flex: 0 0 60%; overflow-y: auto; padding-right: 8px; }
		.refs-actions-panel { flex: 1; min-width: 0; border-left: 1px solid var(--vscode-widget-border); padding-left: 16px; overflow-y: auto; }
		.references-list { display: flex; flex-direction: column; gap: 8px; }
		.reference-item { background: var(--vscode-list-hoverBackground); border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 10px; text-align: left; cursor: pointer; transition: all 0.2s; width: 100%; font-family: var(--vscode-font-family); }
		.reference-item:hover { background: var(--vscode-list-activeSelectionBackground); border-color: var(--vscode-focusBorder); }
		.reference-item.active { background: var(--vscode-list-activeSelectionBackground); border-color: var(--vscode-focusBorder); }
		.ref-title { display: block; font-weight: 500; color: var(--vscode-foreground); margin-bottom: 4px; word-break: break-word; }
		.ref-desc { display: block; font-size: 11px; color: var(--vscode-descriptionForeground); }
		.ref-desc .code-custom-tag { display: inline-block; margin-left: 6px; line-height: 14px; font-size: 10px; }
		.action-btn { display: block; width: 100%; margin-bottom: 8px; padding: 8px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 3px; cursor: pointer; font-size: 12px; font-family: var(--vscode-font-family); transition: background 0.2s; }
		.action-btn:hover { background: var(--vscode-button-hoverBackground); }
		/* Outlined rather than grey: secondary but visibly clickable (grey fills read as disabled in many themes). */
		.action-btn.secondary { background: transparent; color: var(--vscode-textLink-foreground); box-shadow: inset 0 0 0 1px var(--vscode-button-background); }
		.action-btn.secondary:hover { background: var(--vscode-list-hoverBackground); color: var(--vscode-textLink-activeForeground); }
		.action-btn:disabled { opacity: 0.5; cursor: default; }
		.ref-placeholder { font-size: 12px; color: var(--vscode-descriptionForeground); text-align: center; padding: 20px 10px; }
		.refs-toolbar { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
		.reference-item.removed .ref-title { opacity: 0.6; text-decoration: line-through; }
		.ref-desc .ref-tag-removed { color: var(--vscode-descriptionForeground); border-color: var(--vscode-descriptionForeground); }
		.ref-details-title { font-weight: 600; margin-bottom: 16px; color: var(--vscode-foreground); word-break: break-word; }
		.ref-form label { display: block; font-size: 11px; color: var(--vscode-descriptionForeground); margin: 8px 0 3px; }
		.ref-form input, .ref-form textarea { display: block; width: 100%; box-sizing: border-box; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 4px 6px; font-size: 12px; font-family: var(--vscode-font-family); }
		.ref-form textarea { min-height: 90px; resize: vertical; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; white-space: pre; }
		.ref-form input:focus, .ref-form textarea:focus { outline: 1px solid var(--vscode-focusBorder); border-color: var(--vscode-focusBorder); }
		.ref-form-or { font-size: 11px; color: var(--vscode-descriptionForeground); margin: 12px 0 0; text-align: center; }
		.ref-form-error { font-size: 11px; color: var(--vscode-errorForeground); margin: 8px 0; min-height: 0; }
		.ref-form-buttons { display: flex; gap: 8px; margin-top: 12px; }
		.video-description { font-size: 12px; color: var(--vscode-descriptionForeground); margin: -8px 0 16px; word-break: break-word; }
		.ref-form-buttons .action-btn { margin-bottom: 0; }
		.toggle-btn.has-custom::after, .action-card.has-custom .action-label::after, .copy-item.has-custom .nb-label::after { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--vscode-editorWarning-foreground); margin-left: 7px; vertical-align: 1px; }
		.bottom-layout { display: grid; grid-template-columns: 190px 1fr; gap: 24px; margin-top: 0; align-items: start; }
		.left-strip { display: flex; flex-direction: column; }
		.strip-title { font-size: 1.5em; font-weight: 400; color: var(--vscode-foreground); margin: 0 0 5px 0; line-height: initial; }
		.strip-divider { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 10px 0; }
		.column-list { list-style: none; padding: 0 0 0 22px; margin: 0; }
		.column-list li { margin: 0; }
		.list-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 0; text-align: left; width: 100%; white-space: nowrap; }
		.list-btn svg { flex-shrink: 0; }
		.list-btn:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.panel-active { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.paper-links { display: none; }
		.right-panel { border-left: 1px solid var(--vscode-widget-border); padding-left: 20px; padding-top: 4px; display: none; min-width: 0; }
		/* In a narrow editor, stack the opened panel under Next Steps / Learn More. */
		@media (max-width: 600px) {
			.bottom-layout { grid-template-columns: 1fr; }
			.right-panel { border-left: none; padding-left: 22px; }
		}
		.right-panel-title { font-size: 13px; font-weight: 600; margin-bottom: 10px; color: var(--vscode-descriptionForeground); }
		.right-action-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 8px; }
		.action-card { background: transparent; border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 8px 10px; cursor: pointer; text-align: left; font-family: var(--vscode-font-family); display: flex; flex-direction: column; width: 100%; }
		.action-card:hover { background: var(--vscode-list-hoverBackground); }
		.action-label { font-size: 13px; font-weight: 500; color: var(--vscode-textLink-foreground); }
		.action-desc { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 3px; line-height: 1.4; }
		.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
		.panel-back { background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0; }
		.panel-back:hover { color: var(--vscode-textLink-activeForeground); }
		.panel-close { background: transparent; border: none; color: var(--vscode-descriptionForeground); font-size: 16px; line-height: 1; cursor: pointer; padding: 0 2px; }
		.panel-close:hover { color: var(--vscode-foreground); }
		.panel-code-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
		.panel-code-desc { font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 8px; }
		.nb-section-title { font-size: 11px; font-weight: 600; color: var(--vscode-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin: 14px 0 6px 0; }
		.nb-section-title:first-child { margin-top: 0; }
		.nb-divider { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 12px 0; }
		.nb-panel-scroll { overflow-y: auto; max-height: 70vh; padding-right: 4px; }
		.nb-card { background: transparent; border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 10px 12px; cursor: pointer; text-align: left; font-family: var(--vscode-font-family); display: flex; flex-direction: column; width: 100%; transition: background 0.1s; }
		.nb-card:hover { background: var(--vscode-list-hoverBackground); border-color: var(--vscode-textLink-foreground); }
		.nb-label { font-size: 13px; font-weight: 500; color: var(--vscode-textLink-foreground); margin-bottom: 4px; }
		.nb-desc { font-size: 11px; color: var(--vscode-descriptionForeground); line-height: 1.4; }
		${parts.hiddenRowCss ?? ''}
		.code-preview .monaco-tokenized-source { white-space: pre; }
${parts.extraCss ?? ''}	</style>
	<style id="mtk-theme"></style>
</head>
<body>
	<div class="container">

		<div class="title-row">
			<h1>${parts.title}</h1>
			<span class="voice-group">
				<button class="voice-stub" title="Send voice (microphone) — coming soon"><svg width="26" height="26" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1a2 2 0 0 0-2 2v5a2 2 0 1 0 4 0V3a2 2 0 0 0-2-2zM5 7H4v1a4 4 0 0 0 3.5 3.969V14H5v1h6v-1H8.5v-2.031A4 4 0 0 0 12 8V7h-1v1a3 3 0 0 1-6 0V7z"/></svg></button>
				<button class="voice-stub" title="Receive voice (speaker) — coming soon"><svg width="26" height="26" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8.69398 2.03934C8.8792 2.11749 8.99961 2.29898 8.99961 2.50001V13.5C8.99961 13.7014 8.87875 13.8832 8.693 13.9611C8.50725 14.039 8.29289 13.9978 8.14921 13.8567L5.22278 10.9817H3.49963C2.67121 10.9817 1.99963 10.3101 1.99963 9.48172V6.49273C1.99963 5.66431 2.67121 4.99273 3.49963 4.99273H5.22402L8.15073 2.14185C8.29474 2.00157 8.50875 1.96119 8.69398 2.03934ZM7.99961 3.68507L5.77617 5.85089C5.68281 5.94184 5.55763 5.99273 5.42729 5.99273H3.49963C3.22349 5.99273 2.99963 6.21659 2.99963 6.49273V9.48172C2.99963 9.75786 3.22349 9.98172 3.49963 9.98172H5.42729C5.55836 9.98172 5.68419 10.0332 5.77769 10.125L7.99961 12.3079V3.68507ZM10.1109 5.18874C10.2828 4.97264 10.5973 4.93682 10.8135 5.10873L10.8143 5.1094L10.8152 5.11015L10.8174 5.11188L10.8228 5.11628L10.8377 5.12882C10.8495 5.13885 10.8648 5.15224 10.8831 5.16904C10.9197 5.20261 10.9685 5.2499 11.0254 5.31119C11.1389 5.43362 11.2853 5.61296 11.4303 5.85143C11.7218 6.33096 12.0039 7.04439 12.0039 7.99855C12.0039 8.95268 11.7218 9.66687 11.4305 10.1471C11.2857 10.3859 11.1393 10.5657 11.0259 10.6884C10.9692 10.7498 10.9204 10.7973 10.8839 10.8309C10.8642 10.849 10.8441 10.8666 10.8236 10.8838L10.8152 10.8907L10.8143 10.8914C10.8143 10.8914 10.368 11.1337 10.1116 10.8129C9.94006 10.5983 9.97396 10.2858 10.1868 10.1128L10.1883 10.1115L10.1876 10.1122L10.1892 10.1108L10.1883 10.1115C10.1912 10.109 10.1975 10.1036 10.2066 10.0952C10.2248 10.0784 10.2543 10.05 10.2914 10.0098C10.3659 9.92923 10.47 9.80248 10.5755 9.62847C10.7851 9.28301 11.0039 8.74609 11.0039 7.99855C11.0039 7.25106 10.7851 6.71522 10.5758 6.3709C10.4703 6.19744 10.3663 6.07121 10.292 5.99105C10.2549 5.95104 10.2255 5.92278 10.2073 5.90613C10.1982 5.89781 10.192 5.89242 10.1891 5.88995L10.1901 5.89071C9.97439 5.71873 9.93908 5.40472 10.1109 5.18874ZM11.8127 3.10886C11.5966 2.93686 11.2821 2.97255 11.1101 3.18858C10.9382 3.40451 10.9743 3.71932 11.19 3.89138L11.2011 3.9006C11.2119 3.90975 11.2295 3.92484 11.2528 3.94582C11.2994 3.98781 11.369 4.05318 11.4538 4.14133C11.6239 4.31792 11.8537 4.58411 12.0841 4.93509C12.5446 5.63643 13.0029 6.66847 13.0029 8.00405C13.0029 9.33953 12.5446 10.3694 12.0845 11.0685C11.8541 11.4184 11.6244 11.6835 11.4545 11.8593C11.3697 11.947 11.3002 12.0121 11.2536 12.0538C11.2303 12.0747 11.2128 12.0897 11.202 12.0988L11.1904 12.1083L11.1895 12.1091C10.9742 12.2808 10.9382 12.5945 11.1093 12.8105C11.2808 13.0269 11.596 13.0628 11.8125 12.8913L11.8455 12.8642C11.864 12.8487 11.8895 12.8268 11.9209 12.7986C11.9838 12.7423 12.0707 12.6607 12.1735 12.5543C12.3789 12.3418 12.6496 12.0286 12.9197 11.6183C13.4604 10.797 14.0029 9.57884 14.0029 8.00405C14.0029 6.42934 13.4605 5.20938 12.9201 4.38627C12.6501 3.97503 12.3795 3.66089 12.1742 3.4477C12.0714 3.34097 11.9846 3.25908 11.9217 3.20255C11.8903 3.17426 11.8649 3.15228 11.8464 3.13665L11.8239 3.11798L11.8169 3.11222L11.8144 3.11024L11.8127 3.10886ZM10.1891 5.88995L10.1877 5.88874L10.1891 5.88995Z"/></svg></button>			</span>
		</div>
		<div class="powered-by">Powered by:&nbsp;<span id="package-links"></span><span class="package-status" id="package-status"></span><span class="api-key-status" id="api-key-status"></span></div>
		<div class="section" id="sec-points">
			<button class="section-toggle"><span class="illus-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Key Points</button>
			<div class="section-body subtitle">${parts.keyPointsIntro ? `\n\t\t\t\t<p class="pane-intro">${parts.keyPointsIntro}</p>` : ''}
				<ul class="methods-list">
${parts.bullets}</ul>${parts.keyPointsFootnote ? `\n\t\t\t\t<p class="pane-note">${parts.keyPointsFootnote}</p>` : ''}
			</div>
		</div>
		<div class="section collapsed" id="sec-table">
			<button class="section-toggle"><span class="illus-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Decision Table</button>
			<div class="section-body">${parts.decisionIntro ? `\n\t\t\t\t<p class="pane-intro">${parts.decisionIntro}</p>` : ''}
				<table class="decision-table">
					<thead>
						<tr>
							<th>${parts.decisionFirstColumn ?? 'Plot'}</th>
							<th>Data Type</th>
							<th>Use when</th>
						</tr>
					</thead>
					<tbody>
${parts.decisionRows}</tbody>
				</table>${parts.decisionFootnote ? `\n\t\t\t\t<p class="pane-note">${parts.decisionFootnote}</p>` : ''}
			</div>
		</div>

${parts.omitIllustration ? '' : `
		<div class="illus-section ${parts.illusCollapsed === false ? '' : 'collapsed'}" id="illus-section">
			<button class="illus-toggle" id="illus-toggle">
				<span class="illus-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>
				${parts.illustrationLabel ?? 'Illustration'}
			</button>${parts.illustrationIntro ? `\n\t\t\t<p class="pane-intro illus-note">${parts.illustrationIntro}</p>` : ''}
			<div class="illus-body" id="illus-body"></div>${parts.illustrationFootnote ? `\n\t\t\t<p class="pane-note illus-note">${parts.illustrationFootnote}</p>` : ''}
		</div>
`}

		<div class="section" id="sec-code">
			<button class="section-toggle"><span class="illus-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Example Code<span class="code-custom-tag" title="Your saved version of this example. Restore Default brings back the original.">Customised</span></button>
			<div class="section-body">
		<div class="model-toggle" id="model-group">
${parts.togglesJs}
		</div>
${parts.inputsHtml ? `\t\t<div class="scaffold-inputs" id="scaffold-inputs">\n${parts.inputsHtml}\n\t\t</div>\n` : ''}
		<div class="code-preview-wrapper">
			<div class="code-preview" id="code-preview"></div>
			<div class="code-edit-wrap">
				<textarea class="code-edit" id="code-edit" spellcheck="false" aria-label="Example code"></textarea>
				<span class="code-edit-label">Editing</span>
			</div>
			<div class="code-btn-bar code-btn-bar-bottom code-btn-bar-split" id="main-btn-bar">
				<span class="code-btn-group">
					<button class="code-action-btn" id="btn-edit-code" title="Edit this example and keep your version">Edit</button>
					<button class="code-action-btn" id="btn-restore-code" title="Discard your version and bring back the original example" hidden>Restore Default</button>
					<button class="code-action-btn primary" id="btn-save-code" hidden>Save</button>
					<button class="code-action-btn" id="btn-cancel-code" hidden>Cancel</button>${parts.interactiveLabelHtml ? '\n\t\t\t\t\t' + parts.interactiveLabelHtml : ''}
				</span>
				<span class="code-btn-group">
					<button class="code-action-btn" id="btn-copy">Copy</button>
					<button class="code-action-btn" id="btn-julia-repl">Julia REPL</button>
					<button class="code-action-btn" id="btn-new-file">Send to Editor</button>
					<button class="code-action-btn" id="btn-notebook">Send to Notebook</button>
					<button class="code-action-btn" id="btn-pluto">Send to Pluto</button>
				</span>
			</div>
		</div>
			</div>
		</div>

		<div class="bottom-layout">
			<div class="left-strip">
				<div class="section collapsed" id="sec-next">
				<button class="section-toggle"><span class="illus-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Next Steps</button>
				<div class="section-body">
				<ul class="column-list">
${parts.nextStepsHtml ?? `					<li><button class="list-btn panel-toggle" id="btn-viz">${nextStepIcon('visualise')}Visualise</button></li>
					<li><button class="list-btn panel-toggle" id="btn-diagnose">${nextStepIcon('diagnose')}Diagnose</button></li>
					<li><button class="list-btn panel-toggle" id="btn-predict">${nextStepIcon('predict')}Predict</button></li>
					<li><button class="list-btn panel-toggle" id="btn-compare">${nextStepIcon('compare')}Compare</button></li>
					<li><button class="list-btn panel-toggle" id="btn-interpret">${nextStepIcon('interpret')}Interpret</button></li>`}
				</ul>
				</div>
				</div>
				<div class="section collapsed" id="sec-learn">
				<button class="section-toggle"><span class="illus-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>Learn More</button>
				<div class="section-body">
				<ul class="column-list">
					<li><button class="list-btn panel-toggle" id="btn-wiki"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2.5 2C1.67157 2 1 2.67157 1 3.5V12.5C1 13.3284 1.67157 14 2.5 14H6C6.8178 14 7.54389 13.6073 8 13.0002C8.45612 13.6073 9.1822 14 10 14H13.5C14.3284 14 15 13.3284 15 12.5V3.5C15 2.67157 14.3284 2 13.5 2H10C9.1822 2 8.45612 2.39267 8 2.99976C7.54389 2.39267 6.8178 2 6 2H2.5ZM7.5 4.5V11.5C7.5 12.3284 6.82843 13 6 13H2.5C2.22386 13 2 12.7761 2 12.5V3.5C2 3.22386 2.22386 3 2.5 3H6C6.82843 3 7.5 3.67157 7.5 4.5ZM8.5 11.5V4.5C8.5 3.67157 9.17157 3 10 3H13.5C13.7761 3 14 3.22386 14 3.5V12.5C14 12.7761 13.7761 13 13.5 13H10C9.17157 13 8.5 12.3284 8.5 11.5Z"/></svg>Local Wikis</button></li>
					<li><button class="list-btn panel-toggle" id="btn-notebook-tutorials"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M4.75 3C4.33579 3 4 3.33579 4 3.75V5.25C4 5.66421 4.33579 6 4.75 6H10.25C10.6642 6 11 5.66421 11 5.25V3.75C11 3.33579 10.6642 3 10.25 3H4.75ZM5 5V4H10V5H5ZM2 2.75C2 1.7835 2.7835 1 3.75 1H11.25C12.2165 1 13 1.7835 13 2.75V13.25C13 14.2165 12.2165 15 11.25 15H3.75C2.7835 15 2 14.2165 2 13.25V2.75ZM3.75 2C3.33579 2 3 2.33579 3 2.75V13.25C3 13.6642 3.33579 14 3.75 14H11.25C11.6642 14 12 13.6642 12 13.25V2.75C12 2.33579 11.6642 2 11.25 2H3.75ZM14.625 4H14V6H14.625C14.8321 6 15 5.83211 15 5.625V4.375C15 4.16789 14.8321 4 14.625 4ZM14 7H14.625C14.8321 7 15 7.16789 15 7.375V8.625C15 8.83211 14.8321 9 14.625 9H14V7ZM14.625 10H14V12H14.625C14.8321 12 15 11.8321 15 11.625V10.375C15 10.1679 14.8321 10 14.625 10Z"/></svg>Notebook Tutorials</button></li>
					<li><button class="list-btn panel-toggle has-actions" id="btn-documentation"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1C4.14 1 1 4.14 1 8C1 11.86 4.14 15 8 15C11.86 15 15 11.86 15 8C15 4.14 11.86 1 8 1ZM8 14C4.691 14 2 11.309 2 8C2 4.691 4.691 2 8 2C11.309 2 14 4.691 14 8C14 11.309 11.309 14 8 14ZM10.712 8C10.712 8.153 10.63 8.294 10.498 8.371L6.964 10.413C6.536 10.66 6 10.351 6 9.857V6.144C6 5.649 6.536 5.34 6.964 5.588L10.498 7.63C10.631 7.707 10.712 7.847 10.712 8Z"/></svg>Multimedia Tutorials</button></li>
					<li><button class="list-btn panel-toggle has-actions" id="btn-paper"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M9.49999 4H10.5C12.433 4 14 5.567 14 7.5C14 9.36856 12.5357 10.8951 10.6941 10.9948L10.5023 11L9.5023 11.0046C9.22616 11.0059 9.00127 10.783 8.99999 10.5069C8.99888 10.2614 9.17481 10.0565 9.40787 10.0131L9.4977 10.0046L10.5 10C11.8807 10 13 8.88071 13 7.5C13 6.17452 11.9685 5.08996 10.6644 5.00532L10.5 5H9.49999C9.22386 5 8.99999 4.77614 8.99999 4.5C8.99999 4.25454 9.17687 4.05039 9.41012 4.00806L9.49999 4H10.5H9.49999ZM5.5 4H6.5C6.77614 4 7 4.22386 7 4.5C7 4.74546 6.82312 4.94961 6.58988 4.99194L6.5 5H5.5C4.11929 5 3 6.11929 3 7.5C3 8.82548 4.03154 9.91004 5.33562 9.99468L5.5 10H6.5C6.77614 10 7 10.2239 7 10.5C7 10.7455 6.82312 10.9496 6.58988 10.9919L6.5 11H5.5C3.567 11 2 9.433 2 7.5C2 5.63144 3.46428 4.10487 5.30796 4.00518L5.5 4H6.5H5.5ZM5.50023 7L10.5002 7.0023C10.7764 7.00242 11.0001 7.22638 11 7.50252C10.9999 7.74798 10.8229 7.95205 10.5897 7.99428L10.4998 8.0023L5.49977 8C5.22363 7.99987 4.99987 7.77591 5 7.49977C5.00011 7.25431 5.17708 7.05024 5.41035 7.00801L5.50023 7Z"/></svg>Explore References</button></li>
				</ul>
				</div>
				</div>
				<div class="paper-links" id="paper-links"></div>
			</div>
			<div class="right-panel" id="right-panel"></div>
		</div>

	</div>
	<script>
		const vscode = acquireVsCodeApi();
		var currentModel = '${parts.defaultModel}';
		var currentPlainCode = null;        // plain source behind the main code box (for Copy / Send)
		var currentPanelPlainCode = null;   // plain source behind the open Next-Steps panel box
		var currentPanelId = null;
		var wikiSections = [];
		var notebookSections = [];
		var rightPanel = document.getElementById('right-panel');
${parts.headScriptJs ?? ''}
		// Shared inline "last updated" clock icon for explore-pane cards (webviews do not load the
		// codicon font; there is no hourglass codicon). Monochrome, theme-coloured via currentColor.
		var pollisClockSvg = '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" style="vertical-align:-1px;"><circle cx="8" cy="8" r="6"/><path d="M8 8V4.6M8 8l2.6 1.4"/></svg>';
		var MODELS = ${parts.modelsLiteral};

		// Every code box is rendered via the core tokenizer (the user's active theme); see updateCodePreview.

		// Chart layout constants for the gallery illustration
		var CHART_W = ${parts.chartW};   // mini chart width
		var CHART_H = 86;   // mini chart height
		var CHART_GAP = 9;  // gap between charts
		var CHART_Y = 14;   // top of chart area
		// Tile positions and the gallery viewBox derive from the chart count (centred on x=160),
		// so adding or removing a plot needs no manual geometry.
		var CHART_STEP = CHART_W + CHART_GAP;
		var CHART_CONTENT_W = MODELS.length * CHART_W + (MODELS.length - 1) * CHART_GAP;
		var CHART_STARTS = MODELS.map(function(_, i) { return 160 - CHART_CONTENT_W / 2 + i * CHART_STEP; });

		function esc(s)      { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
		function kw(s)       { return '<span class="hl-keyword">' + esc(s) + '</span>'; }
		function fn(s)       { return '<span class="hl-fn">' + esc(s) + '</span>'; }
		function ty(s)       { return '<span class="hl-type">' + esc(s) + '</span>'; }
		function line(s)     { return '<div class="code-line">' + s + '</div>'; }
		function cline(s, c) { return '<div class="code-line">' + s + '<span class="code-comment">  # ' + esc(c) + '</span></div>'; }
		function blank()     { return '<div class="code-blank"></div>'; }
		function val(id, fb) { var el = document.getElementById(id); return esc((el && el.value.trim()) || fb); }
		function sel(id, fb) { var el = document.getElementById(id); return esc((el && el.value) || fb); }

		// ── Parameter inputs ─────────────────────────────────────────────────
		// The raw value of input <id>: a select's choice, or a text input's value (its default when empty).
		function inputRaw(id) {
			if (id === 'model') { return currentModel; }
			var el = document.getElementById('in-' + id);
			if (!el) { return ''; }
			return el.tagName === 'SELECT' ? el.value : (el.value.trim() || el.dataset.default || '');
		}
		// One line of declarative code: an optional {{?id=a|b}} / {{?id!=a|b}} guard, then {{id}} placeholders.
		function holds(id, op, values) { return (values.split('|').indexOf(inputRaw(id)) >= 0) !== (op === '!='); }
		function codeLine(s) {
			// Guards stack: every leading {{?id=a|b}} must hold.
			var m;
			while ((m = /^[{][{][?]([\\w-]+)(!?=)([^}]*)[}][}] ?/.exec(s))) {
				if (!holds(m[1], m[2], m[3])) { return ''; }
				s = s.slice(m[0].length);
			}
			if (!s) { return blank(); }
			// A multi-line value (a textarea) becomes one code line per line.
			return s.replace(/[{][{]([\\w-]+)[}][}]/g, function(_, id) { return inputRaw(id); }).split('\\n').map(function(l) { return l ? line(esc(l)) : blank(); }).join('');
		}
		function availableFor(el) { return !el.dataset.models || el.dataset.models.split(' ').indexOf(currentModel) >= 0; }
		function whenHolds(el) {
			var m = el.dataset.when && /^([\\w-]+)(!?=)(.*)$/.exec(el.dataset.when);
			return !m || holds(m[1], m[2], m[3]);
		}
		// A Next Steps action is listed only for its models and while its \`when\` condition holds; a condition on an input the model hides does not apply.
		function actionShown(a) {
			if (a.models && a.models.indexOf(currentModel) < 0) { return false; }
			var m = a.when && /^([\\w-]+)(!?=)(.*)$/.exec(a.when);
			var input = m && document.getElementById('in-' + m[1]);
			var group = input && input.closest('.scaffold-input');
			return !m || (group && group.hidden) || holds(m[1], m[2], m[3]);
		}
		// Show the inputs (and select choices) of the current model and input values; a hidden choice falls back to the first available one.
		function applyInputsForModel() {
			document.querySelectorAll('.scaffold-input select').forEach(function(select) {
				var first = null;
				Array.prototype.forEach.call(select.options, function(o) {
					var ok = availableFor(o) && whenHolds(o);
					o.hidden = !ok;
					o.disabled = !ok;
					if (ok && !first) { first = o; }
				});
				var current = select.options[select.selectedIndex];
				if (first && (!current || current.disabled)) { first.selected = true; }
			});
			// Visibility last, so conditions see each select's fallback choice
			document.querySelectorAll('.scaffold-input').forEach(function(g) { g.hidden = !availableFor(g) || !whenHolds(g); });
			document.querySelectorAll('.scaffold-inputs .form-row').forEach(function(r) { r.hidden = !r.querySelector('.scaffold-input:not([hidden])'); });
		}

		// ── Mini chart SVG builders (all coordinates within a 54 × 86 box) ──

		${parts.miniChartsJs}

		// ── Gallery illustration ─────────────────────────────────────────────
		function renderIllustration() {
			var body = document.getElementById('illus-body');
			if (!body) { return; }
${parts.illustrationOverrideJs ?? ''}			var activeIdx = MODELS.indexOf(currentModel);

			var vbX = CHART_STARTS[0] - 20;
			var vbW = (CHART_STARTS[CHART_STARTS.length - 1] + CHART_W + 20) - vbX;
			var svgOpen = '<svg viewBox="' + vbX + ' 0 ' + vbW + ' 180" xmlns="http://www.w3.org/2000/svg" '
				+ 'style="width:100%;max-width:' + Math.round(vbW * 4 / 3) + 'px;display:block;margin:0 auto;">';

			var content = '';

			MODELS.forEach(function(m, i) {
				var isActive = (i === activeIdx);
				var ox = CHART_STARTS[i];      // chart origin x
				var oy = CHART_Y;              // chart origin y
				var opacity = isActive ? '1' : '0.22';
				var borderW = isActive ? '2' : '1';
				var fontW  = isActive ? '600' : '400';
				var labelY = oy + CHART_H + 13;

				// Border rectangle
				content += '<rect x="' + ox + '" y="' + oy + '" width="' + CHART_W + '" height="' + CHART_H + '" '
					+ 'rx="3" fill="none" stroke="currentColor" stroke-width="' + borderW + '" opacity="' + opacity + '"/>';

				// Clip the mini chart content inside the border
				content += '<g transform="translate(' + ox + ',' + oy + ')" clip-path="none" opacity="' + opacity + '">';
				content += MINI_CHARTS[i]();
				content += '</g>';

				// Label
				content += '<text x="' + (ox + CHART_W / 2) + '" y="' + labelY + '" '
					+ 'text-anchor="middle" font-size="8.5" font-weight="' + fontW + '" '
					+ 'fill="currentColor" font-family="sans-serif">' + MINI_LABELS[i] + '</text>';
			});

			// Caption
			content += '<text x="160" y="168" text-anchor="middle" font-size="9" fill="currentColor" '
				+ 'font-family="sans-serif" font-style="italic">'
				+ esc(MINI_LABELS[activeIdx]) + ' selected &#8212; click another tab to compare chart shapes'
				+ '</text>';

			body.innerHTML = svgOpen + content + '</svg>';
		}

		// ── Code preview ─────────────────────────────────────────────────────
		function updateCodePreview() {
			var c = '';

			${parts.codeBranchesJs}

			// Build with the local builder, then re-render the box via the core tokenizer
			// (the user's theme), keeping the plain source for Copy / Send and colourising.
			var box = document.getElementById('code-preview');
			currentPlainCode = null;            // so extractCode reads the freshly-built DOM
			box.innerHTML = c;
			currentDefaultCode = extractCode();
			// A saved (customised) example replaces the generated one for this tab.
			var custom = customExamples[currentModel];
			if (typeof custom === 'string') {
				box.innerHTML = custom.split('\\n').map(function(l) { return l ? line(esc(l)) : blank(); }).join('');
				currentPlainCode = custom;
			} else {
				currentPlainCode = currentDefaultCode;   // plain source = single source of truth
			}
			updateCustomState();
			vscode.postMessage({ command: 'colorize', code: currentPlainCode });
		}

		// ── Editable Example Code ────────────────────────────────────────────
		// Saved examples live in ~/.pollis/examples/<panel>/<model>.jl (see createExampleCodeWiring).
		var customExamples = {};       // model -> saved source, sent by the host
		var currentDefaultCode = '';   // generated source for the current tab
		var editingCode = false;
		var restoreTimer = null;
		var SEND_BUTTONS = ['btn-copy', 'btn-julia-repl', 'btn-new-file', 'btn-notebook', 'btn-pluto'];

		function updateCustomState() {
			var isCustom = typeof customExamples[currentModel] === 'string';
			document.getElementById('sec-code').classList.toggle('customised', isCustom);
			document.getElementById('btn-restore-code').hidden = editingCode || !isCustom;
			document.querySelectorAll('#model-group .toggle-btn').forEach(function(b) {
				b.classList.toggle('has-custom', typeof customExamples[b.dataset.model] === 'string');
			});
		}

		function resetRestoreButton() {
			if (restoreTimer) { clearTimeout(restoreTimer); restoreTimer = null; }
			document.getElementById('btn-restore-code').textContent = 'Restore Default';
		}

		function setEditingCode(on) {
			editingCode = on;
			resetRestoreButton();
			document.getElementById('sec-code').classList.toggle('editing', on);
			document.getElementById('btn-edit-code').hidden = on;
			document.getElementById('btn-save-code').hidden = !on;
			document.getElementById('btn-cancel-code').hidden = !on;
			SEND_BUTTONS.forEach(function(id) { document.getElementById(id).disabled = on; });
			updateCustomState();
			if (on) {
				openCodeEdit(document.getElementById('code-edit'), currentPlainCode || '');
			}
		}

		// Fill an edit box, size it to its content and put the caret at the top.
		function openCodeEdit(ta, code) {
			ta.value = code;
			ta.style.height = 'auto';
			ta.style.height = (ta.scrollHeight + 2) + 'px';
			ta.focus();
			ta.setSelectionRange(0, 0);
		}

		// Tab indents with 4 spaces instead of leaving the box; the box grows as lines are added.
		function wireCodeEdit(ta) {
			ta.addEventListener('keydown', function(e) {
				if (e.key === 'Tab' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
					e.preventDefault();
					this.setRangeText('    ', this.selectionStart, this.selectionEnd, 'end');
				}
			});
			ta.addEventListener('input', function() {
				if (this.scrollHeight > this.clientHeight) { this.style.height = (this.scrollHeight + 2) + 'px'; }
			});
		}

		document.getElementById('btn-edit-code').addEventListener('click', function() { setEditingCode(true); });
		document.getElementById('btn-cancel-code').addEventListener('click', function() { setEditingCode(false); });
		document.getElementById('btn-save-code').addEventListener('click', function() {
			var code = document.getElementById('code-edit').value.replace(/\\s+$/, '');
			// Saving the original (or nothing) is the same as restoring the default.
			if (!code || code === currentDefaultCode.replace(/\\s+$/, '')) {
				delete customExamples[currentModel];
				vscode.postMessage({ command: 'restoreExample', model: currentModel });
			} else {
				customExamples[currentModel] = code;
				vscode.postMessage({ command: 'saveExample', model: currentModel, code: code });
			}
			setEditingCode(false);
			updateCodePreview();
		});
		document.getElementById('btn-restore-code').addEventListener('click', function() {
			// Two-step confirmation: the first click asks, a second click within 4 seconds restores.
			if (!restoreTimer) {
				this.textContent = 'Confirm Restore';
				restoreTimer = setTimeout(resetRestoreButton, 4000);
				return;
			}
			resetRestoreButton();
			delete customExamples[currentModel];
			vscode.postMessage({ command: 'restoreExample', model: currentModel });
			updateCodePreview();
		});
		wireCodeEdit(document.getElementById('code-edit'));

		function setModel(model) {
			if (!MODELS.includes(model) || editingCode) { return; }
			resetRestoreButton();
			currentModel = model;
			applyInputsForModel();
${parts.setModelExtraJs ?? ''}			document.querySelectorAll('#model-group .toggle-btn').forEach(function(b) {
				b.classList.toggle('active', b.dataset.model === model);
			});
			renderIllustration();
			updateCodePreview();
			refreshActionList();
		}

		document.getElementById('model-group').addEventListener('click', function(e) {
			var btn = e.target.closest('[data-model]');
			if (btn) { setModel(btn.dataset.model); }
		});

		// Typing in an input refreshes the example and the open Next Steps example.
		function onInputsChanged() {
			applyInputsForModel();
			if (!editingCode) { updateCodePreview(); }
			if (panelAction && !panelEditing && document.getElementById('panel-code') && actionShown(panelAction)) { renderRightCode(panelAction, panelNav.actions, panelNav.title); }
			refreshActionList();
		}
		var inputsBox = document.getElementById('scaffold-inputs');
		if (inputsBox) { inputsBox.addEventListener('input', onInputsChanged); }   // fires for text inputs and selects

		document.querySelector('.subtitle').addEventListener('click', function(e) {
			var link = e.target.closest('.plot-link');
			if (link) { setModel(link.dataset.goto); }
		});

		// ── Right panel ──────────────────────────────────────────────────────
		function hideRightPanel() {
			if (panelEditing) { return; }
			panelAction = null;
			rightPanel.innerHTML = '';
			rightPanel.style.display = 'none';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			currentPanelId = null;
		}

		// Re-list the open Next Steps group after a model or input change; an example no longer listed falls back to the list.
		function refreshActionList() {
			if (!listNav || panelEditing || currentPanelId !== listNav.panelId) { return; }
			if (!panelAction || !actionShown(panelAction)) { renderRightList(listNav.actions, listNav.title); }
		}

		function renderRightList(actions, title) {
			panelAction = null;
			listNav = { actions: actions, title: title, panelId: currentPanelId };
			var cards = actions.filter(actionShown).map(function(a) {
				return '<button class="action-card' + (typeof customSteps[a.id] === 'string' ? ' has-custom' : '') + '" data-id="' + a.id + '">'
					+ '<span class="action-label">' + esc(a.label) + '</span>'
					+ '<span class="action-desc">' + esc(a.desc) + '</span>'
					+ '</button>';
			}).join('');
			rightPanel.innerHTML =
				'<div class="panel-header">'
				+ '<span class="right-panel-title">' + esc(title) + '</span>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="right-action-grid">' + cards + '</div>';
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			actions.forEach(function(a) {
				var btn = rightPanel.querySelector('[data-id="' + a.id + '"]');
				if (btn) { btn.addEventListener('click', function() { renderRightCode(a, actions, title); }); }
			});
		}

		function renderRightCode(action, actions, title) {
			panelAction = action;
			panelNav = { actions: actions, title: title };
			rightPanel.innerHTML =
				'<div class="panel-header">'
				+ '<button class="panel-back" id="btn-panel-back">&#x2190; ' + esc(title) + '</button>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="panel-code-title">' + esc(action.label) + '<span class="code-custom-tag" title="Your saved version of this example. Restore Default brings back the original.">Customised</span></div>'
				+ '<div class="panel-code-desc">' + esc(action.desc) + '</div>'
				+ '<div class="code-preview-wrapper">'
				+ '<div class="code-preview" id="panel-code">' + action.code() + '</div>'
				+ '<div class="code-edit-wrap">'
				+ '<textarea class="code-edit" id="panel-edit" spellcheck="false" aria-label="Example code"></textarea>'
				+ '<span class="code-edit-label">Editing</span>'
				+ '</div>'
				+ '<div class="code-btn-bar code-btn-bar-bottom code-btn-bar-split" id="panel-btn-bar">'
				+ '<span class="code-btn-group">'
				+ '<button class="code-action-btn" id="btn-panel-edit" title="Edit this example and keep your version">Edit</button>'
				+ '<button class="code-action-btn" id="btn-panel-restore" title="Discard your version and bring back the original example" hidden>Restore Default</button>'
				+ '<button class="code-action-btn primary" id="btn-panel-save" hidden>Save</button>'
				+ '<button class="code-action-btn" id="btn-panel-cancel" hidden>Cancel</button>'
				+ '</span>'
				+ '<span class="code-btn-group">'
				+ '<button class="code-action-btn" data-act="copy">Copy</button>'
				+ '<button class="code-action-btn" data-act="juliaRepl">Julia REPL</button>'
				+ '<button class="code-action-btn" data-act="newFile">Send to Editor</button>'
				+ '<button class="code-action-btn" data-act="notebook">Send to Notebook</button>'
				+ '<button class="code-action-btn" data-act="pluto">Send to Pluto</button>'
				+ '</span>'
				+ '</div>'
				+ '</div>';
			// The generated example is the default; a saved (customised) one replaces it.
			var box = document.getElementById('panel-code');
			currentPanelPlainCode = null;                       // so extractCode reads the freshly-built DOM
			panelDefaultCode = extractCode('panel-code');
			var custom = customSteps[action.id];
			if (typeof custom === 'string') {
				box.innerHTML = custom.split('\\n').map(function(l) { return l ? line(esc(l)) : blank(); }).join('');
				currentPanelPlainCode = custom;
			} else {
				currentPanelPlainCode = panelDefaultCode;       // plain source for Copy / Send
			}
			updatePanelCustomState();
			// Re-render the panel box via the core tokenizer (the user's theme), like the main box.
			vscode.postMessage({ command: 'colorize', code: currentPanelPlainCode, target: 'panel' });
			document.getElementById('btn-panel-back').addEventListener('click', function() { renderRightList(actions, title); });
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			wireCodeEdit(document.getElementById('panel-edit'));
			document.getElementById('btn-panel-edit').addEventListener('click', function() { setPanelEditing(true); });
			document.getElementById('btn-panel-cancel').addEventListener('click', function() { setPanelEditing(false); });
			document.getElementById('btn-panel-save').addEventListener('click', function() {
				var code = document.getElementById('panel-edit').value.replace(/\\s+$/, '');
				// Saving the original (or nothing) is the same as restoring the default.
				if (!code || code === panelDefaultCode.replace(/\\s+$/, '')) {
					delete customSteps[action.id];
					vscode.postMessage({ command: 'restoreExample', step: action.id });
				} else {
					customSteps[action.id] = code;
					vscode.postMessage({ command: 'saveExample', step: action.id, code: code });
				}
				setPanelEditing(false);
				renderRightCode(action, actions, title);
			});
			document.getElementById('btn-panel-restore').addEventListener('click', function() {
				// Two-step confirmation: the first click asks, a second click within 4 seconds restores.
				if (!panelRestoreTimer) {
					this.textContent = 'Confirm Restore';
					panelRestoreTimer = setTimeout(resetPanelRestoreButton, 4000);
					return;
				}
				resetPanelRestoreButton();
				delete customSteps[action.id];
				vscode.postMessage({ command: 'restoreExample', step: action.id });
				renderRightCode(action, actions, title);
			});
			document.getElementById('panel-btn-bar').addEventListener('click', function(e) {
				var b = e.target.closest('[data-act]');
				if (!b || b.disabled) { return; }
				var act = b.dataset.act;
				var code = extractCode('panel-code');
				if (act === 'copy') {
					navigator.clipboard.writeText(code).then(function() {
						b.textContent = 'Copied!';
						setTimeout(function() { b.textContent = 'Copy'; }, 2000);
					});
				} else {
					vscode.postMessage({ command: 'runCode', target: act, code: code });
				}
			});
		}

		// ── Editable Next Steps examples ─────────────────────────────────────
		// Saved examples live in ~/.pollis/examples/<panel>/next-steps/<id>.jl (see createExampleCodeWiring).
		var customSteps = {};          // action id -> saved source, sent by the host
		var panelAction = null;        // the Next Steps example open in the panel, if any
		var panelNav = null;           // the list it was opened from ({ actions, title }), for re-rendering
		var listNav = null;            // the Next Steps list last shown ({ actions, title, panelId }), re-filtered on model/input changes
		var panelDefaultCode = '';     // its generated source
		var panelEditing = false;
		var panelRestoreTimer = null;

		function updatePanelCustomState() {
			var isCustom = !!panelAction && typeof customSteps[panelAction.id] === 'string';
			rightPanel.classList.toggle('customised', isCustom);
			var restore = document.getElementById('btn-panel-restore');
			if (restore) { restore.hidden = panelEditing || !isCustom; }
		}

		function resetPanelRestoreButton() {
			if (panelRestoreTimer) { clearTimeout(panelRestoreTimer); panelRestoreTimer = null; }
			var restore = document.getElementById('btn-panel-restore');
			if (restore) { restore.textContent = 'Restore Default'; }
		}

		// While editing, the panel cannot be left (back, close, other Next Steps / Learn More entries).
		function setPanelEditing(on) {
			panelEditing = on;
			resetPanelRestoreButton();
			rightPanel.classList.toggle('editing', on);
			document.querySelector('.bottom-layout').classList.toggle('panel-editing', on);
			document.getElementById('btn-panel-back').disabled = on;
			document.getElementById('btn-panel-close').disabled = on;
			document.getElementById('btn-panel-edit').hidden = on;
			document.getElementById('btn-panel-save').hidden = !on;
			document.getElementById('btn-panel-cancel').hidden = !on;
			rightPanel.querySelectorAll('#panel-btn-bar [data-act]').forEach(function(b) { b.disabled = on; });
			updatePanelCustomState();
			if (on) { openCodeEdit(document.getElementById('panel-edit'), currentPanelPlainCode || ''); }
		}

		function showRightPanel(actions, title, btnId) {
			if (panelEditing) { return; }
			if (currentPanelId === btnId) { hideRightPanel(); return; }
			currentPanelId = btnId;
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			document.getElementById(btnId).classList.add('panel-active');
			renderRightList(actions, title);
			rightPanel.style.display = 'block';
		}

		function renderNotebookPanel() {
			if (!notebookSections.length) { return; }
			var html = '<div class="panel-header">'
				+ '<span class="right-panel-title">Notebook Tutorials</span>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div><div class="nb-panel-scroll">';
			var nbRendered = 0;
			notebookSections.forEach(function(section) {
				if (!section.notebooks.length) { return; }
				if (nbRendered > 0) { html += '<hr class="nb-divider">'; }
				nbRendered++;
				html += '<div class="right-action-grid">';
				section.notebooks.forEach(function(n) {
					html += copyCardHtml('notebook', n.file, '<button class="nb-card" data-nb="' + esc(n.file) + '">'
						+ '<span class="nb-label">' + esc(n.name) + '</span>'
						+ (n.description ? '<span class="nb-desc">' + esc(n.description) + '</span>' : '')
						+ '</button>');
				});
				html += '</div>';
			});
			html += '</div>';
			rightPanel.innerHTML = html;
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			rightPanel.querySelectorAll('.nb-card[data-nb]').forEach(function(card) {
				card.addEventListener('click', function() { vscode.postMessage({ command: 'openNotebook', target: card.dataset.nb }); });
			});
			wireCopyLinks();
		}

		function renderWikiPanel() {
			if (!wikiSections.length) { return; }
			var html = '<div class="panel-header">'
				+ '<span class="right-panel-title">Local Wikis</span>'
				+ '<button class="panel-close" id="btn-panel-close">&#xd7;</button>'
				+ '</div><div class="nb-panel-scroll">';
			var wikiRendered = 0;
			wikiSections.forEach(function(section) {
				if (!section.wikis.length) { return; }
				if (wikiRendered > 0) { html += '<hr class="nb-divider">'; }
				wikiRendered++;
				html += '<div class="right-action-grid">';
				section.wikis.forEach(function(w) {
					html += copyCardHtml('wiki', w.file, '<button class="nb-card" data-wiki="' + esc(w.file) + '">'
						+ '<span class="nb-label">' + esc(w.name) + '</span>'
						+ (w.description ? '<span class="nb-desc">' + esc(w.description) + '</span>' : '')
						+ '</button>');
				});
				html += '</div>';
			});
			html += '</div>';
			rightPanel.innerHTML = html;
			document.getElementById('btn-panel-close').addEventListener('click', hideRightPanel);
			rightPanel.querySelectorAll('.nb-card[data-wiki]').forEach(function(card) {
				card.addEventListener('click', function() { vscode.postMessage({ command: 'openWiki', target: card.dataset.wiki }); });
			});
			wireCopyLinks();
		}

		// ── Customisable wikis and notebooks ─────────────────────────────────
		// Customised copies live in ~/.pollis/wikis/ and ~/.pollis/notebooks/ (see createCustomCopyWiring).
		var customCopies = { wiki: [], notebook: [] };   // kind -> files with a customised copy

		// Wrap a Local Wikis / Notebook Tutorials card with its Edit / Restore Default links.
		// A notebook is edited where it opens, so it only gets Restore Default.
		function copyCardHtml(kind, file, cardHtml) {
			if (!file) { return cardHtml; }   // an external link: nothing to customise
			var noun = kind === 'wiki' ? 'wiki' : 'notebook';
			return '<div class="copy-item' + (customCopies[kind].indexOf(file) >= 0 ? ' has-custom' : '') + '" data-copy-kind="' + kind + '" data-copy-file="' + esc(file) + '">'
				+ cardHtml
				+ '<span class="copy-actions">'
				+ (kind === 'wiki' ? '<button class="copy-link" data-copy-act="edit" title="Edit this wiki and keep your version">Edit</button>' : '')
				+ '<button class="copy-link" data-copy-act="restore" title="Discard your version and bring back the original ' + noun + '">Restore Default</button>'
				+ '</span>'
				+ '</div>';
		}

		function wireCopyLinks() {
			rightPanel.querySelectorAll('.copy-link[data-copy-act]').forEach(function(link) {
				link.addEventListener('click', function() {
					var item = link.closest('.copy-item');
					var msg = { kind: item.dataset.copyKind, target: item.dataset.copyFile };
					if (link.dataset.copyAct === 'edit') {
						msg.command = 'editCopy';
						vscode.postMessage(msg);
						return;
					}
					// Two-step confirmation: the first click asks, a second click within 4 seconds restores.
					if (!link.dataset.confirming) {
						link.dataset.confirming = '1';
						link.textContent = 'Confirm Restore';
						setTimeout(function() { delete link.dataset.confirming; link.textContent = 'Restore Default'; }, 4000);
						return;
					}
					msg.command = 'restoreCopy';
					vscode.postMessage(msg);
				});
			});
		}

		// ── Explore References ───────────────────────────────────────────────
		// The bundled references (which the user can correct or remove) plus the ones the user added,
		// all kept in ~/.pollis/references/<panel>.bib; see createReferenceWiring. Each has an id, title,
		// authors, year, openAccess, kind ('bundled' | 'customised' | 'added'), removed, url and bibtex.
		var references = [];
		var selectedRefId = null;
		var refFormOpen = false;     // the Add / Edit form is showing
		var refFormId = null;        // the reference being edited (null: adding one)
		var showRemovedRefs = false;

		function renderReferencesPanel() {
			rightPanel.innerHTML = '<div class="panel-header">'
				+ '<span class="right-panel-title">Explore References</span>'
				+ '<button class="panel-close" id="btn-refs-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="refs-container">'
				+ '<div class="refs-list-panel">'
				+ '<div class="refs-toolbar">'
				+ '<button class="copy-link" id="btn-ref-add" title="Add a reference of your own to this panel">+ Add Reference</button>'
				+ '<button class="copy-link" id="btn-ref-removed"></button>'
				+ '</div>'
				+ '<div class="references-list" id="refs-list"></div>'
				+ '</div>'
				+ '<div class="refs-actions-panel" id="refs-details"></div>'
				+ '</div>';
			document.getElementById('btn-refs-close').addEventListener('click', hideRightPanel);
			document.getElementById('btn-ref-add').addEventListener('click', function() { openReferenceForm(null); });
			document.getElementById('btn-ref-removed').addEventListener('click', function() {
				showRemovedRefs = !showRemovedRefs;
				renderReferenceList();
				if (!showRemovedRefs && !refFormOpen && references.some(function(r) { return r.id === selectedRefId && r.removed; })) {
					selectedRefId = null;
					renderReferenceDetails();
				}
			});
			renderReferenceList();
			if (refFormOpen) { renderReferenceForm(); } else { renderReferenceDetails(); }
		}

		function referenceTag(ref) {
			if (ref.removed) { return '<span class="code-custom-tag ref-tag-removed" title="A reference you removed. Select it to restore it.">Removed</span>'; }
			if (ref.kind === 'customised') { return '<span class="code-custom-tag" title="Your corrected version of this reference. Restore Default brings back the original.">Customised</span>'; }
			if (ref.kind === 'added') { return '<span class="code-custom-tag" title="A reference you added.">Added</span>'; }
			return '';
		}

		function renderReferenceList() {
			var list = document.getElementById('refs-list');
			if (!list) { return; }
			var removedCount = references.filter(function(r) { return r.removed; }).length;
			var removedLink = document.getElementById('btn-ref-removed');
			removedLink.hidden = removedCount === 0;
			removedLink.textContent = showRemovedRefs ? 'Hide Removed' : 'Show Removed (' + removedCount + ')';
			var shown = references.filter(function(r) { return showRemovedRefs || !r.removed; });
			if (!shown.length) {
				list.innerHTML = '<div class="ref-placeholder">No references yet.</div>';
				return;
			}
			list.innerHTML = shown.map(function(ref) {
				var desc = [ref.authors, ref.year, ref.openAccess ? 'Open Access' : ''].filter(Boolean).map(esc).join(' \\xb7 ');
				return '<button class="reference-item' + (ref.id === selectedRefId ? ' active' : '') + (ref.removed ? ' removed' : '') + '" data-ref-id="' + esc(ref.id) + '">'
					+ '<span class="ref-title">' + esc(ref.title) + '</span>'
					+ '<span class="ref-desc">' + desc + referenceTag(ref) + '</span>'
					+ '</button>';
			}).join('');
			list.querySelectorAll('.reference-item').forEach(function(btn) {
				btn.addEventListener('click', function() {
					selectedRefId = btn.dataset.refId;
					refFormOpen = false;
					list.querySelectorAll('.reference-item').forEach(function(b) { b.classList.toggle('active', b === btn); });
					renderReferenceDetails();
				});
			});
		}

		// A button that needs a second click within 4 seconds before it posts its message.
		function confirmButton(btn, confirmLabel, message) {
			var label = btn.textContent;
			btn.addEventListener('click', function() {
				if (!btn.dataset.confirming) {
					btn.dataset.confirming = '1';
					btn.textContent = confirmLabel;
					setTimeout(function() { delete btn.dataset.confirming; btn.textContent = label; }, 4000);
					return;
				}
				btn.disabled = true;
				vscode.postMessage(message);
			});
		}

		function renderReferenceDetails() {
			var details = document.getElementById('refs-details');
			if (!details) { return; }
			var ref = references.find(function(r) { return r.id === selectedRefId; });
			if (!ref) {
				details.innerHTML = '<div class="ref-placeholder">Select a reference to view details</div>';
				return;
			}
			var html = '<div class="ref-details-title">' + esc(ref.title) + '</div>';
			if (ref.removed) {
				html += '<button class="action-btn" id="btn-restore-ref" title="Show this reference again">Restore</button>';
			} else {
				html += (ref.url ? '<button class="action-btn" id="btn-open-ref">Open in Browser</button>' : '')
					+ '<button class="action-btn" id="btn-copy-bibtex">Copy BibTeX to Clipboard</button>'
					+ '<button class="action-btn secondary" id="btn-edit-ref" title="Correct this reference (its BibTeX)">Edit</button>'
					+ (ref.kind === 'customised' ? '<button class="action-btn secondary" id="btn-restore-ref" title="Discard your correction and bring back the original reference">Restore Default</button>' : '')
					+ '<button class="action-btn secondary" id="btn-remove-ref" title="' + (ref.kind === 'added' ? 'Delete this reference from your references file' : 'Hide this reference; Show Removed brings it back') + '">Remove</button>';
			}
			details.innerHTML = html;
			if (ref.removed) {
				document.getElementById('btn-restore-ref').addEventListener('click', function() {
					this.disabled = true;
					vscode.postMessage({ command: 'restoreReference', id: ref.id });
				});
				return;
			}
			if (ref.url) {
				document.getElementById('btn-open-ref').addEventListener('click', function() {
					vscode.postMessage({ command: 'openReference', id: ref.id });
				});
			}
			document.getElementById('btn-copy-bibtex').addEventListener('click', function() {
				var btn = this;
				navigator.clipboard.writeText(ref.bibtex).then(function() {
					btn.textContent = 'Copied!';
					setTimeout(function() { btn.textContent = 'Copy BibTeX to Clipboard'; }, 2000);
				});
			});
			document.getElementById('btn-edit-ref').addEventListener('click', function() { openReferenceForm(ref.id); });
			if (ref.kind === 'customised') {
				confirmButton(document.getElementById('btn-restore-ref'), 'Confirm Restore', { command: 'restoreReference', id: ref.id });
			}
			confirmButton(document.getElementById('btn-remove-ref'), 'Confirm Remove', { command: 'removeReference', id: ref.id });
		}

		// Open the Add Reference form (id null) or the Edit form of reference id.
		function openReferenceForm(id) {
			refFormOpen = true;
			refFormId = id;
			if (id === null) {
				selectedRefId = null;
				renderReferenceList();
			}
			renderReferenceForm();
		}

		function renderReferenceForm() {
			var details = document.getElementById('refs-details');
			if (!details) { return; }
			var ref = refFormId === null ? null : references.find(function(r) { return r.id === refFormId; });
			if (refFormId !== null && !ref) { refFormOpen = false; renderReferenceDetails(); return; }
			details.innerHTML = '<div class="ref-details-title">' + (ref ? 'Edit Reference' : 'Add Reference') + '</div>'
				+ '<div class="ref-form">'
				+ '<label for="ref-bibtex">' + (ref ? 'BibTeX' : 'Paste BibTeX') + '</label>'
				+ '<textarea id="ref-bibtex" spellcheck="false" placeholder="@article{key, title = {...}, ...}"></textarea>'
				+ (ref ? '' : '<div class="ref-form-or">or enter the details</div>'
					+ '<label for="ref-title">Title</label><input id="ref-title" type="text">'
					+ '<label for="ref-authors">Authors</label><input id="ref-authors" type="text" placeholder="Last, First; Last, First">'
					+ '<label for="ref-year">Year</label><input id="ref-year" type="text" inputmode="numeric" maxlength="4">'
					+ '<label for="ref-link">Link or DOI</label><input id="ref-link" type="text" placeholder="https://... or 10....">')
				+ '<div class="ref-form-error" id="ref-form-error"></div>'
				+ '<div class="ref-form-buttons">'
				+ '<button class="action-btn" id="btn-ref-save">' + (ref ? 'Save' : 'Add') + '</button>'
				+ '<button class="action-btn secondary" id="btn-ref-cancel">Cancel</button>'
				+ '</div>'
				+ '</div>';
			var textarea = document.getElementById('ref-bibtex');
			if (ref) { textarea.value = ref.bibtex; textarea.style.minHeight = '200px'; }
			textarea.focus();
			document.getElementById('btn-ref-cancel').addEventListener('click', function() {
				refFormOpen = false;
				renderReferenceDetails();
			});
			document.getElementById('btn-ref-save').addEventListener('click', function() {
				this.disabled = true;
				document.getElementById('ref-form-error').textContent = '';
				var value = function(id) { var input = document.getElementById(id); return input ? input.value : ''; };
				var message = { command: 'saveReference', bibtex: textarea.value, title: value('ref-title'), authors: value('ref-authors'), year: value('ref-year'), link: value('ref-link') };
				if (ref) { message.id = ref.id; }
				vscode.postMessage(message);
			});
		}

		// ── Multimedia Tutorials ─────────────────────────────────────────────
		// The panel's bundled videos (which the user can correct or remove) plus the ones the user added,
		// kept in ~/.pollis/videos/<panel>.json; see createVideoWiring. Each has an id, title, url,
		// description, kind ('bundled' | 'customised' | 'added') and removed.
		var videos = [];
		var selectedVideoId = null;
		var videoFormOpen = false;   // the Add / Edit form is showing
		var videoFormId = null;      // the video being edited (null: adding one)
		var showRemovedVideos = false;

		function videoHost(url) {
			var match = /^https?:\\/\\/(?:www\\.)?([^\\/?#]+)/i.exec(url || '');
			return match ? match[1] : '';
		}

		function renderVideosPanel() {
			rightPanel.innerHTML = '<div class="panel-header">'
				+ '<span class="right-panel-title">Multimedia Tutorials</span>'
				+ '<button class="panel-close" id="btn-videos-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="refs-container">'
				+ '<div class="refs-list-panel">'
				+ '<div class="refs-toolbar">'
				+ '<button class="copy-link" id="btn-video-add" title="Add a link to a video (a lecture recording, YouTube, Vimeo...) to this panel">+ Add Video</button>'
				+ '<button class="copy-link" id="btn-video-removed"></button>'
				+ '</div>'
				+ '<div class="references-list" id="videos-list"></div>'
				+ '</div>'
				+ '<div class="refs-actions-panel" id="videos-details"></div>'
				+ '</div>';
			document.getElementById('btn-videos-close').addEventListener('click', hideRightPanel);
			document.getElementById('btn-video-add').addEventListener('click', function() { openVideoForm(null); });
			document.getElementById('btn-video-removed').addEventListener('click', function() {
				showRemovedVideos = !showRemovedVideos;
				renderVideoList();
				if (!showRemovedVideos && !videoFormOpen && videos.some(function(v) { return v.id === selectedVideoId && v.removed; })) {
					selectedVideoId = null;
					renderVideoDetails();
				}
			});
			renderVideoList();
			if (videoFormOpen) { renderVideoForm(); } else { renderVideoDetails(); }
		}

		function videoTag(video) {
			if (video.removed) { return '<span class="code-custom-tag ref-tag-removed" title="A video you removed. Select it to restore it.">Removed</span>'; }
			if (video.kind === 'customised') { return '<span class="code-custom-tag" title="Your corrected version of this video. Restore Default brings back the original.">Customised</span>'; }
			if (video.kind === 'added') { return '<span class="code-custom-tag" title="A video you added.">Added</span>'; }
			return '';
		}

		function renderVideoList() {
			var list = document.getElementById('videos-list');
			if (!list) { return; }
			var removedCount = videos.filter(function(v) { return v.removed; }).length;
			var removedLink = document.getElementById('btn-video-removed');
			removedLink.hidden = removedCount === 0;
			removedLink.textContent = showRemovedVideos ? 'Hide Removed' : 'Show Removed (' + removedCount + ')';
			var shown = videos.filter(function(v) { return showRemovedVideos || !v.removed; });
			if (!shown.length) {
				list.innerHTML = '<div class="ref-placeholder">No videos yet. Use + Add Video to link a lecture recording or tutorial.</div>';
				return;
			}
			list.innerHTML = shown.map(function(video) {
				var desc = [video.description, videoHost(video.url)].filter(Boolean).map(esc).join(' \\xb7 ');
				return '<button class="reference-item' + (video.id === selectedVideoId ? ' active' : '') + (video.removed ? ' removed' : '') + '" data-video-id="' + esc(video.id) + '">'
					+ '<span class="ref-title">' + esc(video.title) + '</span>'
					+ '<span class="ref-desc">' + desc + videoTag(video) + '</span>'
					+ '</button>';
			}).join('');
			list.querySelectorAll('.reference-item').forEach(function(btn) {
				btn.addEventListener('click', function() {
					selectedVideoId = btn.dataset.videoId;
					videoFormOpen = false;
					list.querySelectorAll('.reference-item').forEach(function(b) { b.classList.toggle('active', b === btn); });
					renderVideoDetails();
				});
				btn.addEventListener('dblclick', function() {
					var video = videos.find(function(v) { return v.id === btn.dataset.videoId; });
					if (video && !video.removed) { vscode.postMessage({ command: 'openVideo', id: video.id }); }
				});
			});
		}

		function renderVideoDetails() {
			var details = document.getElementById('videos-details');
			if (!details) { return; }
			var video = videos.find(function(v) { return v.id === selectedVideoId; });
			if (!video) {
				details.innerHTML = '<div class="ref-placeholder">Select a video to view details</div>';
				return;
			}
			var html = '<div class="ref-details-title">' + esc(video.title) + '</div>'
				+ (video.description ? '<div class="video-description">' + esc(video.description) + '</div>' : '');
			if (video.removed) {
				html += '<button class="action-btn" id="btn-restore-video" title="Show this video again">Restore</button>';
			} else {
				html += '<button class="action-btn" id="btn-open-video" title="' + esc(video.url) + '">Open in Browser</button>'
					+ '<button class="action-btn" id="btn-copy-video">Copy Link</button>'
					+ '<button class="action-btn secondary" id="btn-edit-video" title="Change the title, link or description">Edit</button>'
					+ (video.kind === 'customised' ? '<button class="action-btn secondary" id="btn-restore-video" title="Discard your correction and bring back the original video">Restore Default</button>' : '')
					+ '<button class="action-btn secondary" id="btn-remove-video" title="' + (video.kind === 'added' ? 'Delete this video from your videos file' : 'Hide this video; Show Removed brings it back') + '">Remove</button>';
			}
			details.innerHTML = html;
			if (video.removed) {
				document.getElementById('btn-restore-video').addEventListener('click', function() {
					this.disabled = true;
					vscode.postMessage({ command: 'restoreVideo', id: video.id });
				});
				return;
			}
			document.getElementById('btn-open-video').addEventListener('click', function() {
				vscode.postMessage({ command: 'openVideo', id: video.id });
			});
			document.getElementById('btn-copy-video').addEventListener('click', function() {
				var btn = this;
				navigator.clipboard.writeText(video.url).then(function() {
					btn.textContent = 'Copied!';
					setTimeout(function() { btn.textContent = 'Copy Link'; }, 2000);
				});
			});
			document.getElementById('btn-edit-video').addEventListener('click', function() { openVideoForm(video.id); });
			if (video.kind === 'customised') {
				confirmButton(document.getElementById('btn-restore-video'), 'Confirm Restore', { command: 'restoreVideo', id: video.id });
			}
			confirmButton(document.getElementById('btn-remove-video'), 'Confirm Remove', { command: 'removeVideo', id: video.id });
		}

		// Open the Add Video form (id null) or the Edit form of video id.
		function openVideoForm(id) {
			videoFormOpen = true;
			videoFormId = id;
			if (id === null) {
				selectedVideoId = null;
				renderVideoList();
			}
			renderVideoForm();
		}

		function renderVideoForm() {
			var details = document.getElementById('videos-details');
			if (!details) { return; }
			var video = videoFormId === null ? null : videos.find(function(v) { return v.id === videoFormId; });
			if (videoFormId !== null && !video) { videoFormOpen = false; renderVideoDetails(); return; }
			details.innerHTML = '<div class="ref-details-title">' + (video ? 'Edit Video' : 'Add Video') + '</div>'
				+ '<div class="ref-form">'
				+ '<label for="video-title">Title</label><input id="video-title" type="text">'
				+ '<label for="video-url">Link</label><input id="video-url" type="text" placeholder="https://...">'
				+ '<label for="video-description">Description (optional)</label><input id="video-description" type="text">'
				+ '<div class="ref-form-error" id="video-form-error"></div>'
				+ '<div class="ref-form-buttons">'
				+ '<button class="action-btn" id="btn-video-save">' + (video ? 'Save' : 'Add') + '</button>'
				+ '<button class="action-btn secondary" id="btn-video-cancel">Cancel</button>'
				+ '</div>'
				+ '</div>';
			if (video) {
				document.getElementById('video-title').value = video.title;
				document.getElementById('video-url').value = video.url;
				document.getElementById('video-description').value = video.description;
			}
			document.getElementById('video-title').focus();
			document.getElementById('btn-video-cancel').addEventListener('click', function() {
				videoFormOpen = false;
				renderVideoDetails();
			});
			document.getElementById('btn-video-save').addEventListener('click', function() {
				this.disabled = true;
				document.getElementById('video-form-error').textContent = '';
				var message = { command: 'saveVideo', title: document.getElementById('video-title').value, url: document.getElementById('video-url').value, description: document.getElementById('video-description').value };
				if (video) { message.id = video.id; }
				vscode.postMessage(message);
			});
		}

		// ── Action arrays ────────────────────────────────────────────────────
		${parts.actionsJs}

		// ── Button wiring ────────────────────────────────────────────────────
${parts.nextStepsWiringJs ?? `		document.getElementById('btn-viz').addEventListener('click', function() {
			showRightPanel(VISUALISE_ACTIONS, 'Visualise', 'btn-viz');
		});
		document.getElementById('btn-diagnose').addEventListener('click', function() {
			showRightPanel(DIAGNOSE_ACTIONS, 'Diagnose', 'btn-diagnose');
		});
		document.getElementById('btn-predict').addEventListener('click', function() {
			showRightPanel(PREDICT_ACTIONS, 'Predict', 'btn-predict');
		});
		document.getElementById('btn-compare').addEventListener('click', function() {
			showRightPanel(COMPARE_ACTIONS, 'Compare', 'btn-compare');
		});
		document.getElementById('btn-interpret').addEventListener('click', function() {
			showRightPanel(INTERPRET_ACTIONS, 'Interpret', 'btn-interpret');
		});`}

		document.getElementById('btn-wiki').addEventListener('click', function() {
			if (currentPanelId === 'btn-wiki') { hideRightPanel(); return; }
			currentPanelId = 'btn-wiki';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			renderWikiPanel();
			rightPanel.style.display = 'block';
		});

		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (currentPanelId === 'btn-notebook-tutorials') { hideRightPanel(); return; }
			currentPanelId = 'btn-notebook-tutorials';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			renderNotebookPanel();
			rightPanel.style.display = 'block';
		});

		document.getElementById('btn-documentation').addEventListener('click', function() {
			if (currentPanelId === 'btn-documentation') { hideRightPanel(); return; }
			currentPanelId = 'btn-documentation';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			selectedVideoId = null;
			videoFormOpen = false;
			showRemovedVideos = false;
			renderVideosPanel();
			rightPanel.style.display = 'block';
			vscode.postMessage({ command: 'listVideos' });   // pick up a hand-edited videos file
		});
		document.getElementById('btn-paper').addEventListener('click', function() {
			if (currentPanelId === 'btn-paper') { hideRightPanel(); return; }
			currentPanelId = 'btn-paper';
			document.querySelectorAll('.panel-toggle').forEach(function(b) { b.classList.remove('panel-active'); });
			this.classList.add('panel-active');
			selectedRefId = null;
			refFormOpen = false;
			showRemovedRefs = false;
			renderReferencesPanel();
			rightPanel.style.display = 'block';
			vscode.postMessage({ command: 'listReferences' });   // pick up a hand-edited references file
		});

		function extractCode(id) {
			// When a box shows core-colorized HTML, the plain source is the truth, not the DOM.
			if ((!id || id === 'code-preview') && currentPlainCode !== null) { return currentPlainCode; }
			if (id === 'panel-code' && currentPanelPlainCode !== null) { return currentPanelPlainCode; }
			var lines = document.getElementById(id || 'code-preview').querySelectorAll('.code-line, .code-blank');
			return Array.from(lines).map(function(l) { return l.textContent || ''; }).join('\\n');
		}

		document.getElementById('btn-copy').addEventListener('click', function() {
			navigator.clipboard.writeText(extractCode()).then(function() {
				var btn = document.getElementById('btn-copy');
				btn.textContent = 'Copied!';
				setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
			});
		});
		document.getElementById('btn-new-file').addEventListener('click', function() {
			vscode.postMessage({ command: 'runCode', target: 'newFile', code: extractCode() });
		});
		document.getElementById('btn-notebook').addEventListener('click', function() {
			vscode.postMessage({ command: 'runCode', target: 'notebook', code: extractCode() });
		});
		document.getElementById('btn-pluto').addEventListener('click', function() {
			vscode.postMessage({ command: 'runCode', target: 'pluto', code: extractCode() });
		});
		document.getElementById('btn-julia-repl').addEventListener('click', function() {
			vscode.postMessage({ command: 'runCode', target: 'juliaRepl', code: extractCode() });
		});

		var illusToggle = document.getElementById('illus-toggle');
		if (illusToggle) {
			illusToggle.addEventListener('click', function() {
				document.getElementById('illus-section').classList.toggle('collapsed');
			});
		}
		document.querySelectorAll('.section-toggle').forEach(function(t) {
			t.addEventListener('click', function() { t.closest('.section').classList.toggle('collapsed'); });
		});
		document.querySelectorAll('.voice-stub').forEach(function(btn) {
			btn.addEventListener('click', function() { this.classList.toggle('active'); });
		});

		document.querySelectorAll('.tooltip-icon').forEach(function(icon) {
			icon.addEventListener('click', function(e) {
				e.stopPropagation();
				var tip = this.nextElementSibling;
				if (tip && tip.classList.contains('tooltip-text')) {
					var wasPinned = tip.classList.contains('pinned');
					tip.classList.toggle('pinned');
					this.classList.toggle('pinned');
					if (wasPinned) {
						tip.style.display = 'none';
						this.addEventListener('mouseleave', function() { tip.style.display = ''; }, { once: true });
					}
				}
			});
		});

		// Floating tooltips: any .tooltip-icon carrying a data-tip attribute shows a single shared,
		// position:fixed tooltip (hover to show, click to pin, click away to dismiss). Document-level
		// delegation so it covers icons created after load and inside scrolling/overflow containers,
		// where the sibling .tooltip-text pattern above would be clipped. Plain (non-data-tip) icons
		// keep using the sibling pattern, so this is purely additive.
		(function() {
			var floatTip = document.createElement('div');
			floatTip.className = 'tooltip-text tooltip-floating';
			floatTip.style.display = 'none';
			document.body.appendChild(floatTip);
			var pinnedIcon = null;
			function showFloatTip(icon) {
				floatTip.textContent = icon.dataset.tip;
				floatTip.style.display = 'block';
				var r = icon.getBoundingClientRect();
				var left = Math.min(r.left, window.innerWidth - floatTip.offsetWidth - 8);
				floatTip.style.left = Math.round(Math.max(8, left)) + 'px';
				floatTip.style.top = Math.round(r.bottom + 6) + 'px';
			}
			function hideFloatTip() { floatTip.style.display = 'none'; }
			document.addEventListener('mouseover', function(e) {
				var icon = e.target.closest ? e.target.closest('.tooltip-icon[data-tip]') : null;
				if (icon && !pinnedIcon) { showFloatTip(icon); }
			});
			document.addEventListener('mouseout', function(e) {
				if (!pinnedIcon && e.target.closest && e.target.closest('.tooltip-icon[data-tip]')) { hideFloatTip(); }
			});
			document.addEventListener('click', function(e) {
				var icon = e.target.closest ? e.target.closest('.tooltip-icon[data-tip]') : null;
				if (icon) {
					e.preventDefault();
					e.stopPropagation();
					if (pinnedIcon === icon) { icon.classList.remove('pinned'); pinnedIcon = null; hideFloatTip(); }
					else { if (pinnedIcon) { pinnedIcon.classList.remove('pinned'); } pinnedIcon = icon; icon.classList.add('pinned'); showFloatTip(icon); }
				} else if (pinnedIcon) { pinnedIcon.classList.remove('pinned'); pinnedIcon = null; hideFloatTip(); }
			});
		})();

		// Bracket-pair colourisation, mirroring the editor: colour () [] {} by nesting depth using
		// the active theme's bracket colours. Open and matching close share a colour; depth cycles 1..6.
		function colorizeBrackets(root) {
			var OPEN = '([{', CLOSE = ')]}';
			var depth = 0;
			var nodes = [];
			var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
			var n;
			while ((n = walker.nextNode())) { nodes.push(n); }
			// A tokenized comment is its own span whose first non-space char is '#'.
			// Skip those so brackets inside comments keep the comment colour.
			function inComment(node) {
				var el = node.parentElement;
				if (!el) { return false; }
				var t = el.textContent || '';
				var i = 0;
				while (i < t.length && (t.charAt(i) === ' ' || t.charAt(i) === '\t')) { i++; }
				return t.charAt(i) === '#';
			}
			nodes.forEach(function(node) {
				if (inComment(node)) { return; }
				var text = node.nodeValue;
				var frag = document.createDocumentFragment();
				var buf = '';
				var flush = function() { if (buf) { frag.appendChild(document.createTextNode(buf)); buf = ''; } };
				for (var i = 0; i < text.length; i++) {
					var ch = text[i];
					var idx;
					if (OPEN.indexOf(ch) !== -1) {
						flush();
						idx = (depth % 6) + 1; depth++;
					} else if (CLOSE.indexOf(ch) !== -1) {
						flush();
						depth = depth > 0 ? depth - 1 : 0; idx = (depth % 6) + 1;
					} else {
						buf += ch; continue;
					}
					var s = document.createElement('span');
					s.textContent = ch;
					s.style.color = 'var(--vscode-editorBracketHighlight-foreground' + idx + ')';
					frag.appendChild(s);
				}
				flush();
				node.parentNode.replaceChild(frag, node);
			});
		}

		function renderPackageStatus(statuses, env) {
			var el = document.getElementById('package-status');
			if (!el) { return; }
			if (!statuses.length) { el.innerHTML = ''; return; }
			var missing = statuses.filter(function(s) { return !s.installed; });
			if (missing.length === 0) {
				el.innerHTML = '<span class="pkg-check">&#10003;</span>';
				el.firstChild.title = env ? 'All packages declared in ' + env : 'All packages installed';
				return;
			}
			var names = missing.map(function(s) { return s.name; }).join(', ');
			el.innerHTML = '<span class="pkg-install" id="pkg-install-btn">'
				+ '<svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 1v7.585L5.207 6.293l-.707.707L8 10.5l3.5-3.5-.707-.707L8.5 8.585V1h-1z"/><path d="M2 13h12v1H2z"/></svg>'
				+ 'Install</span>';
			var btn = document.getElementById('pkg-install-btn');
			if (btn) {
				btn.title = 'Install missing: ' + names + ' — into your active Julia environment';
				btn.addEventListener('click', function() {
					el.innerHTML = '<span class="pkg-installing" title="Installing in the Julia REPL…">installing&#8230;</span>';
					vscode.postMessage({ command: 'installPackages' });
				});
			}
		}

		function renderApiKeyStatus(msg) {
			var el = document.getElementById('api-key-status');
			if (!el) { return; }
			var label = msg.label || '';
			var noun = msg.noun || 'API key';
			var keyIcon = '<svg class="apikey-icon" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 1a5 5 0 0 0-4.9 6.02L1 11.12V15h3.88l.62-.62v-1.5h1.5v-1.5h1.5l.48-.48A5 5 0 1 0 10 1zm1.75 4.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/></svg>';
			if (msg.hasKey) {
				el.innerHTML = '<span class="apikey-ok" title="' + label + ' ' + noun + ' saved in VS Code Secret Storage">' + keyIcon + noun + '</span>'
					+ '<span class="apikey-sep">|</span>'
					+ '<a class="apikey-link" id="apikey-change">change</a>'
					+ '<span class="apikey-sep">|</span>'
					+ '<a class="apikey-link" id="apikey-clear">clear</a>';
				document.getElementById('apikey-change').addEventListener('click', function() { vscode.postMessage({ command: 'setApiKey' }); });
				document.getElementById('apikey-clear').addEventListener('click', function() { vscode.postMessage({ command: 'clearApiKey' }); });
			} else {
				el.innerHTML = '<a class="apikey-link" id="apikey-set" title="Store your ' + label + ' ' + noun + ' securely in VS Code Secret Storage">' + keyIcon + 'Set ' + noun + '</a>';
				document.getElementById('apikey-set').addEventListener('click', function() { vscode.postMessage({ command: 'setApiKey' }); });
			}
		}

		window.addEventListener('message', function(event) {
			var msg = event.data;
			if (!msg) { return; }
			if (msg.command === 'apiKeyStatus') { renderApiKeyStatus(msg); }
			if (msg.command === 'packageLinks') {
				var container = document.getElementById('package-links');
				container.innerHTML = '';
				var pkgs = msg.packages || [];
				pkgs.forEach(function(pkg, i) {
					var a = document.createElement('a');
					a.className = 'package-link';
					a.textContent = pkg.name;
					a.title = pkg.url;
					a.addEventListener('click', function(e) { e.preventDefault(); vscode.postMessage({ command: 'openUrl', url: pkg.url }); });
					container.appendChild(a);
					if (i < pkgs.length - 1) { container.appendChild(document.createTextNode(', ')); }
				});
			}
			if (msg.command === 'packageStatus') { renderPackageStatus(msg.statuses || [], msg.env || ''); }
			if (msg.command === 'paperLinks') {
				var btn = document.getElementById('btn-paper');
				if (btn) { btn.classList.toggle('has-actions', !!msg.hasPapers); }
			}
			if (msg.command === 'notebookSections') { notebookSections = msg.sections || []; }
			if (msg.command === 'wikiSections') { wikiSections = msg.sections || []; }
			if (msg.command === 'references') {
				references = msg.references || [];
				if (selectedRefId && !references.some(function(r) { return r.id === selectedRefId && (showRemovedRefs || !r.removed); })) { selectedRefId = null; }
				if (currentPanelId === 'btn-paper') {
					renderReferenceList();
					if (!refFormOpen) { renderReferenceDetails(); }
				}
			}
			if (msg.command === 'referenceSaved') {
				refFormOpen = false;
				selectedRefId = msg.id;
				if (currentPanelId === 'btn-paper') { renderReferenceList(); renderReferenceDetails(); }
			}
			if (msg.command === 'referenceSaveFailed') {
				var refError = document.getElementById('ref-form-error');
				var refSave = document.getElementById('btn-ref-save');
				if (refError) { refError.textContent = msg.message || ''; }
				if (refSave) { refSave.disabled = false; }
			}
			if (msg.command === 'videos') {
				videos = msg.videos || [];
				if (selectedVideoId && !videos.some(function(v) { return v.id === selectedVideoId && (showRemovedVideos || !v.removed); })) { selectedVideoId = null; }
				if (currentPanelId === 'btn-documentation') {
					renderVideoList();
					if (!videoFormOpen) { renderVideoDetails(); }
				}
			}
			if (msg.command === 'videoSaved') {
				videoFormOpen = false;
				selectedVideoId = msg.id;
				if (currentPanelId === 'btn-documentation') { renderVideoList(); renderVideoDetails(); }
			}
			if (msg.command === 'videoSaveFailed') {
				var videoError = document.getElementById('video-form-error');
				var videoSave = document.getElementById('btn-video-save');
				if (videoError) { videoError.textContent = msg.message || ''; }
				if (videoSave) { videoSave.disabled = false; }
			}
			if (msg.command === 'customCopies') {
				customCopies = { wiki: msg.wikis || [], notebook: msg.notebooks || [] };
				rightPanel.querySelectorAll('.copy-item[data-copy-kind]').forEach(function(item) {
					item.classList.toggle('has-custom', customCopies[item.dataset.copyKind].indexOf(item.dataset.copyFile) >= 0);
				});
			}
			if (msg.command === 'colorizedCode') {
				document.getElementById('mtk-theme').textContent = msg.css || '';
				var box = document.getElementById(msg.target === 'panel' ? 'panel-code' : 'code-preview');
				if (box) { box.innerHTML = msg.html || ''; colorizeBrackets(box); }
			}
			if (msg.command === 'customExamples') {
				customExamples = msg.examples || {};
				if (editingCode) { updateCustomState(); } else { updateCodePreview(); }
				customSteps = msg.steps || {};
				rightPanel.querySelectorAll('.action-card[data-id]').forEach(function(c) {
					c.classList.toggle('has-custom', typeof customSteps[c.dataset.id] === 'string');
				});
				if (panelAction && document.getElementById('panel-code')) {
					var shown = typeof customSteps[panelAction.id] === 'string' ? customSteps[panelAction.id] : panelDefaultCode;
					if (panelEditing || shown === currentPanelPlainCode) { updatePanelCustomState(); } else { renderRightCode(panelAction, panelNav.actions, panelNav.title); }
				}
			}
			if (msg.command === 'setModel') { setModel(msg.model); }
		});

		setModel('${parts.defaultModel}');
${parts.tailScriptJs ?? ''}
${parts.extraJs ?? ''}	</script>
</body>
</html>`;
}
