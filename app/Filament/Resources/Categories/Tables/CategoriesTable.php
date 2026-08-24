<?php

namespace App\Filament\Resources\Categories\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class CategoriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label('الاسم')->searchable(),
                TextColumn::make('parent.name')->label('القسم الأب')->placeholder('— قسم رئيسي —'),
                TextColumn::make('icon')->label('الأيقونة'),
                TextColumn::make('books_count')->label('عدد الكتب')->counts('books')->sortable(),
                IconColumn::make('is_fallback')->label('قسم "أخرى"')->boolean(),
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