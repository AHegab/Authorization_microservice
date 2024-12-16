import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'public', name: 'users' }) // Map this entity to the "users" table
export class User {
    @PrimaryGeneratedColumn('uuid') // Automatically generates a UUID for the ID
    id: string;

    
    @Column({ unique: true }) // Unique email for each user
    email: string;

    @Column() // Hashed password
    hashedPassword: string;

    @Column({ nullable: false }) // First name is required
    firstName: string;

    @Column({ nullable: true }) // Optional middle name
    middleName?: string;

    @Column({ nullable: false }) // Last name is required
    lastName: string;

    @Column({ type: 'text', nullable: true }) // Profile picture URL
    profilePicture?: string;

    @Column({ type: 'timestamp', nullable: true }) // Birthday is optional
    birthDay?: Date;

    @Column({ type: 'timestamp', nullable: true }) // Tracks last login timestamp
    lastLogin?: Date;

    @Column({ default: true }) // Indicates if the user is active
    isActive: boolean;

    @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' }) // User role
    role: 'user' | 'admin';

    @Column({ unique: false, nullable: true }) // Optional and unique phone number
    phoneNumber?: string;

    @Column({
        type: 'jsonb', // JSONB type to store an array of objects
        default: [],
    })
    cards: {
        cardNumber: string; // Masked card number (e.g., last 4 digits)
        cardType: 'CreditCard' | 'DebitCard'; // Type of card
        expiryDate: string; // Expiry date in MM/YY format
        amount: number; // Associated amount with the card (optional)
    }[] = []; // Default to an empty array

    @Column({ nullable: true }) // Two-factor authentication secret
    twoFactorSecret?: string;

    @Column({
        type: 'jsonb', // JSONB type for storing budgets as key-value pairs
        default: {},
    })
    budgets: Record<string, number> = {};

    @Column({ default: false }) // Indicates if 2FA is enabled
    isTwoFactorEnabled: boolean;

    @CreateDateColumn() // Auto-generated creation timestamp
    createdAt: Date;

    @UpdateDateColumn() // Auto-generated update timestamp
    updatedAt: Date;
}
