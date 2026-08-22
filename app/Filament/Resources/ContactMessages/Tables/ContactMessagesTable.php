<?php

namespace App\Filament\Resources\ContactMessages\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ContactMessagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                BadgeColumn::make('type')
                    ->label('النوع')
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'general' => 'عام',
                        'publish_request' => 'طلب نشر',
                        'order' => 'طلب',
                        'copyright' => 'حقوق نشر',
                        'print_request' => 'طلب طباعة',
                        default => 'أخرى',
                    })
                    ->colors([
                        'danger' => fn ($state) => $state === 'copyright',
                        'warning' => fn ($state) => $state === 'print_request',
                        'primary' => fn ($state) => in_array($state, ['general', 'order', 'other']),
                        'success' => fn ($state) => $state === 'publish_request',
                    ]),
                TextColumn::make('name')->label('الاسم')->searchable(),
                TextColumn::make('email')->label('البريد')->searchable(),
                TextColumn::make('subject')->label('الموضوع')->searchable()->limit(40),
                TextColumn::make('book_title')->label('الكتاب')->placeholder('—'),
                TextColumn::make('created_at')->label('التاريخ')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->label('النوع')
                    ->options([
                        'general' => 'عام',
                        'publish_request' => 'طلب نشر',
                        'order' => 'طلب',
                        'copyright' => 'حقوق نشر',
                        'print_request' => 'طلب طباعة',
                        'other' => 'أخرى',
                    ]),
            ])
            ->recordActions([
                EditAction::make()->label('عرض التفاصيل'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()->label('حذف'),
                ]),
            ]);
    }
}