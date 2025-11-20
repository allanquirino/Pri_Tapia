# Plan for Redesigning Site to ONG PriTapia

## Overview
Completely redesign the existing beauty clinic site (NAEstetica) to serve as the website for ONG PriTapia, an animal welfare organization. Remove all beauty-related content and replace with NGO-focused content including castration registration, veterinary care information, and photo gallery.

## Current Structure Analysis
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: PHP with MySQL
- **Database**: hg0e7639_PriTapia (already updated)
- **Current Pages**: Index (beauty services), Login, Admin, various clinic management pages
- **Components**: Reusable UI components, testimonials, news list, etc.

## New Site Structure
- **Homepage (/)**: NGO introduction, links to registration and veterinary event
- **Castration Registration (/cadastro-castracao)**: Form for animal owners to register for castration
- **Gallery (/galeria)**: Photos of veterinary attendances
- **Admin (/admin)**: Manage registrations, export to Excel
- **Login (/login)**: Admin login

## Database Changes
### New Table: castration_registrations
```sql
CREATE TABLE IF NOT EXISTS castration_registrations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    animal_type ENUM('gato', 'cachorro') NOT NULL,
    sex ENUM('macho', 'femea') NOT NULL,
    age VARCHAR(50),
    castration_status ENUM('castrado', 'nao_castrado') NOT NULL,
    vaccines_up_to_date TINYINT(1) NOT NULL DEFAULT 0,
    called TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Triggers
- Update trigger for updated_at
- Audit trigger for inserts

## Content Changes
- **Logo**: Update wexio.png to PriTapia logo (improve existing)
- **Colors**: Change from pink/purple to green tones
- **Instagram Link**: https://www.instagram.com/pritapia?igsh=YmZ0bXppMW15dGVn&utm_source=qr
- **Bio Content**: Based on Instagram - animal welfare, castration campaigns, veterinary care

## Implementation Steps
1. Update database schema
2. Create backend API for registration form
3. Redesign homepage with NGO content
4. Create registration page
5. Create gallery page
6. Update admin panel for registrations
7. Update CSS for green theme
8. Update logo
9. Write contract document
10. Test functionality

## Contract Document
Create a terms of service/contract for the landing page outlining:
- NGO services
- User responsibilities
- Data privacy
- Contact information

## Technical Considerations
- Keep existing authentication system
- Export registrations to Excel (CSV format)
- Responsive design maintained
- Domain: pritapia.com.br (already configured)