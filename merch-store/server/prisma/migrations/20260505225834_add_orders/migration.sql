-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NULL,
    `deliveryProvider` ENUM('CUSTOM', 'CDEK') NOT NULL DEFAULT 'CUSTOM',
    `deliveryMethod` ENUM('COURIER', 'PICKUP_POINT') NOT NULL DEFAULT 'COURIER',
    `deliveryTariffCode` VARCHAR(191) NULL,
    `deliveryPrice` INTEGER NOT NULL DEFAULT 0,
    `deliveryCity` VARCHAR(191) NOT NULL,
    `deliveryStreet` VARCHAR(191) NOT NULL,
    `deliveryHouse` VARCHAR(191) NOT NULL,
    `deliveryApartment` VARCHAR(191) NULL,
    `deliveryEntrance` VARCHAR(191) NULL,
    `deliveryFloor` VARCHAR(191) NULL,
    `deliveryComment` VARCHAR(191) NULL,
    `cdekCityCode` VARCHAR(191) NULL,
    `cdekPvzCode` VARCHAR(191) NULL,
    `cdekOrderUuid` VARCHAR(191) NULL,
    `cdekTrackNumber` VARCHAR(191) NULL,
    `promoCode` VARCHAR(191) NULL,
    `subtotal` INTEGER NOT NULL,
    `discountTotal` INTEGER NOT NULL DEFAULT 0,
    `total` INTEGER NOT NULL,
    `status` ENUM('CREATED', 'CONFIRMED', 'ASSEMBLING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'CREATED',
    `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    INDEX `Order_userId_idx`(`userId`),
    INDEX `Order_status_idx`(`status`),
    INDEX `Order_paymentStatus_idx`(`paymentStatus`),
    INDEX `Order_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `unitPrice` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `totalPrice` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderItem_orderId_idx`(`orderId`),
    INDEX `OrderItem_productId_idx`(`productId`),
    INDEX `OrderItem_variantId_idx`(`variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
