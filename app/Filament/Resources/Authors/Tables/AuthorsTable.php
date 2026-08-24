<?php

namespace App\Filament\Resources\Authors\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AuthorsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label('الاسم')->searchable(),
                TextColumn::make('title')->label('اللقب')
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'professor' => 'أستاذ',
                        'doctor' => 'دكتور',
                        'researcher' => 'باحث',
                        default => 'بلا لقب',
                    }),
                TextColumn::make('books_count')->label('عدد الكتب')->counts('books')->sortable(),
                TextColumn::make('user.email')->label('البريد (إن وُجد حساب)')->placeholder('بلا حساب'),
                TextColumn::make('created_at')->label('تاريخ الإضافة')->dateTime()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make()->label('تعديل'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()->label('حذف'),
                ]),
            ]);
    }
}